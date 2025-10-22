# -*- coding: utf-8 -*-
"""
iBase.exe 启动包装器 · PyQt6（无黑边·高DPI·精致UI）
- 外层外边距=0：卡片铺满窗口圆角
- 圆角用 QRegion + Path（无黑边、兼容高DPI）
- 顶部横幅提示（错误提示使用横幅，复制成功展示居中提示）
- 激活码右侧“眼睛”图标内嵌在输入框中，点击切换明/密
- 更优中文字体优先级与微调
- 首次激活写入配置；后续直启 iBase.exe
"""
import os
import sys
import json
import uuid
import time
import hashlib
import platform
import subprocess
from datetime import datetime, date
from pathlib import Path
from typing import Optional, Tuple
import string

from PyQt6.QtCore import (
    Qt, QTimer, QPoint, QPointF, QRectF, QPropertyAnimation, QEasingCurve, QProcess,
    QSize, QEvent, pyqtSignal
)
from PyQt6.QtGui import (
    QFont, QFontDatabase, QPalette, QColor, QClipboard,
    QPainter, QPainterPath, QLinearGradient, QRegion, QIcon, QPixmap, QPen,
    QRadialGradient, QConicalGradient
)
from PyQt6.QtWidgets import (
    QApplication, QDialog, QLabel, QLineEdit, QPushButton, QVBoxLayout, QHBoxLayout,
    QWidget, QFrame, QGridLayout, QSizePolicy, QGraphicsDropShadowEffect, QToolButton,
    QGraphicsOpacityEffect, QMessageBox
)

# ======================= 基本信息 =======================
APP_NAME   = "iBaseWrapper"
CONFIG_DIR = Path(os.getenv("APPDATA", str(Path.home()))) / APP_NAME
CONFIG_PATH= CONFIG_DIR / "config.json"

def base_dir() -> Path:
    if getattr(sys, 'frozen', False) and hasattr(sys, '_MEIPASS'):
        return Path(sys.executable).parent
    return Path(__file__).parent

IBASE_EXE_PATH = base_dir() / "iBase.exe"

# !!! 将此密钥替换为你的私钥（至少 32 字符）
SECRET_KEY     = "REPLACE_WITH_YOUR_SECRET_32_CHARS_MIN"

CODE_LENGTH    = 16
GROUP_SIZE     = 4
HEX_CHARS      = "0123456789ABCDEF"
ACTIVATION_EPOCH = date(2024, 1, 1)

# ======================= 机器码 / 激活码 =======================
def _win_machine_guid() -> str:
    if os.name != "nt":
        return ""
    try:
        import winreg
        k = winreg.OpenKey(
            winreg.HKEY_LOCAL_MACHINE,
            r"SOFTWARE\Microsoft\Cryptography",
            0,
            winreg.KEY_READ | winreg.KEY_WOW64_64KEY
        )
        guid, _ = winreg.QueryValueEx(k, "MachineGuid")
        k.Close()
        return str(guid)
    except Exception:
        return ""

def _wmic_uuid() -> str:
    if os.name != "nt":
        return ""
    try:
        out = subprocess.check_output(
            ["wmic", "csproduct", "get", "uuid"], stderr=subprocess.DEVNULL
        )
        lines = out.decode(errors="ignore").strip().splitlines()
        if len(lines) >= 2:
            return lines[1].strip()
    except Exception:
        pass
    return ""

def _mac_hex() -> str:
    try:
        m = uuid.getnode()
        if (m >> 40) & 1:
            return ""
        return f"{m:012X}"
    except Exception:
        return ""

def _compute_machine_digest() -> str:
    parts = []
    if os.name == "nt":
        g = _win_machine_guid()
        if g:
            parts.append(g)
        u = _wmic_uuid()
        if u:
            parts.append(u)
    parts += [
        platform.node(),
        platform.system(),
        platform.release(),
        platform.version(),
        _mac_hex() or "UNKNOWNMAC",
    ]
    raw = "|".join([p for p in parts if p])
    return hashlib.sha1(raw.encode("utf-8")).hexdigest().upper()


def _format_groups(text: str, step: int = 4) -> str:
    return "-".join(text[i : i + step] for i in range(0, len(text), step))


def get_machine_code_raw() -> str:
    return _compute_machine_digest()[:16]


def get_machine_code() -> str:
    return _format_groups(get_machine_code_raw())


def normalize_machine_code(mc: str) -> str:
    return "".join(ch for ch in mc.upper() if ch in string.hexdigits).upper()


def calc_activation_code(mc: str, expiry: date | datetime | str) -> str:
    if isinstance(expiry, (date, datetime)):
        expiry_str = expiry.strftime("%Y%m%d")
    else:
        expiry_str = str(expiry)
    payload = f"{mc}{expiry_str}{SECRET_KEY}"
    return hashlib.sha256(payload.encode("utf-8")).hexdigest().upper()[:16]


def format_activation_code(expiry: date, code_fragment: str) -> str:
    return f"{expiry.strftime('%Y%m%d')}-{_format_groups(code_fragment, 4)}"


def verify_activation_code(mc: str, code: str) -> Tuple[bool, Optional[date], Optional[str], Optional[str]]:
    cleaned = "".join(ch for ch in (code or "").upper() if ch.isalnum())
    if len(cleaned) != 24:
        return False, None, None, "激活码格式不正确，请核对后再试。"
    date_part, hash_part = cleaned[:8], cleaned[8:]
    if not date_part.isdigit():
        return False, None, None, "激活码格式不正确，请核对后再试。"
    try:
        expiry = datetime.strptime(date_part, "%Y%m%d").date()
    except ValueError:
        return False, None, None, "激活码格式不正确，请核对后再试。"
    hash_part = hash_part.upper()
    valid_hex = set(string.hexdigits.upper())
    if any(ch not in valid_hex for ch in hash_part):
        return False, expiry, None, "激活码格式不正确，请核对后再试。"
    expected = calc_activation_code(mc, date_part)
    if hash_part != expected:
        return False, expiry, format_activation_code(expiry, hash_part), "激活码不正确，请核对后再试。"
    if expiry < date.today():
        return False, expiry, format_activation_code(expiry, hash_part), "激活码已过期，请联系管理员。"
    canonical = format_activation_code(expiry, hash_part)
    return True, expiry, canonical, None

# ======================= 配置读写 =======================
def load_config() -> dict:
    try:
        if CONFIG_PATH.exists():
            with open(CONFIG_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
    except Exception:
        pass
    return {}

def save_config(cfg: dict) -> None:
    try:
        CONFIG_DIR.mkdir(parents=True, exist_ok=True)
        with open(CONFIG_PATH, "w", encoding="utf-8") as f:
            json.dump(cfg, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print("保存配置失败：", e)

# ======================= 主题与样式 =======================
class Theme:
    BG   = QColor(240, 248, 255)
    CARD = QColor(255, 255, 255, 240)
    TXT  = QColor(10, 10, 10)
    MUT  = QColor(160, 160, 160)
    BAD  = QColor(226, 84, 92)
    OK   = QColor(32, 168, 140)
    A1   = QColor(127, 199, 245)
    A2   = QColor(183, 168, 255)
    A3   = QColor(245, 177, 210)

    @staticmethod
    def _available_fonts() -> set:
        try:
            fams = QFontDatabase.families()
            return set(fams) if fams else set()
        except Exception:
            pass
        try:
            qfd = QFontDatabase()
            return set(qfd.families())
        except Exception:
            return set()

    @staticmethod
    def apply(app: QApplication):
        QApplication.setStyle("Fusion")
        # 更优中文字体优先级
        prefer = [
            "Source Han Sans SC", "Noto Sans CJK SC",
            "MiSans", "HarmonyOS Sans SC", "Alibaba PuHuiTi 3.0",
            "Microsoft YaHei UI", "Microsoft YaHei",
            "Segoe UI Variable Display", "Segoe UI", "Inter", "SF Pro Display"
        ]
        fams = Theme._available_fonts()
        chosen = None
        for fam in prefer:
            if fam in fams:
                chosen = fam
                break

        f = QFont(chosen if chosen else app.font().family())
        f.setStyleStrategy(QFont.StyleStrategy.PreferAntialias)
        f.setPointSize(12)
        # 稍微压一点字重与字距，整体更克制
        f.setWeight(QFont.Weight.Medium)
        app.setFont(f)

        pal = QPalette()
        pal.setColor(QPalette.ColorRole.Window, Theme.BG)
        pal.setColor(QPalette.ColorRole.WindowText, Theme.TXT)
        pal.setColor(QPalette.ColorRole.Base, QColor(18, 20, 26))
        pal.setColor(QPalette.ColorRole.Text, Theme.TXT)
        pal.setColor(QPalette.ColorRole.Button, QColor(36, 40, 52))
        pal.setColor(QPalette.ColorRole.ButtonText, Theme.TXT)
        pal.setColor(QPalette.ColorRole.Highlight, QColor(120, 170, 255))
        pal.setColor(QPalette.ColorRole.HighlightedText, QColor(255, 255, 255))
        app.setPalette(pal)

        app.setStyleSheet(f"""
        QWidget{{ color:{Theme.TXT.name()}; font-size:12pt; background: transparent; }}
        .Card{{
            background: qlineargradient(x1:0,y1:0,x2:1,y2:1,
                stop:0 rgba(255,255,255,0.88),
                stop:1 rgba(234,242,255,0.72)
            );
            border: 1px solid rgba(120,135,170,0.28);
            border-radius: 18px;
        }}
        QLabel#H1{{ font-size:17pt; font-weight:800; letter-spacing:.2px; }}
        QLabel#Sub{{ color:{Theme.MUT.name()}; }}
        QLabel#Hint{{ color:{Theme.MUT.name()}; font-size:11pt; }}
        QLabel#Banner{{ padding:8px 12px; border-radius:10px; font-weight:700; }}
        QLineEdit{{
            background: qlineargradient(x1:0,y1:0,x2:1,y2:1,
                stop:0 rgba(255,255,255,0.86),
                stop:1 rgba(236,242,255,0.62)
            );
            border: 1px solid rgba(135,150,185,0.46);
            border-radius:14px;
            padding:8px 42px 8px 16px;
            min-height:36px;
            font-size:13pt;
            color: rgba(6,8,16,0.94);
            selection-background-color: rgba(120,170,255,0.42);
            selection-color: rgba(6,8,16,0.98);
        }}
        QLineEdit:hover{{
            background: qlineargradient(x1:0,y1:0,x2:1,y2:1,
                stop:0 rgba(255,255,255,0.92),
                stop:1 rgba(228,238,255,0.70)
            );
            border:1px solid rgba(120,176,255,0.80);
        }}
        QLineEdit:focus{{
            border:1px solid rgba(112,176,255,0.96);
            background: qlineargradient(x1:0,y1:0,x2:1,y2:1,
                stop:0 rgba(255,255,255,0.98),
                stop:1 rgba(220,236,255,0.84)
            );
        }}
        QLineEdit::placeholder{{ color: rgba(12,12,16,0.48); }}
        QLineEdit[readOnly="true"]{{
            color: rgba(70,120,180,0.94);
            font-family:Consolas,'Cascadia Mono','JetBrains Mono',monospace;
            letter-spacing:.6px;
            font-size:13pt;
            background: rgba(240,248,255,0.46);
        }}
        QPushButton{{
            min-height:38px;
            padding:0 26px;
            border-radius:20px;
            font-weight:700;
            letter-spacing:.32px;
            color:rgba(28,28,30,0.90);
            background: qlineargradient(x1:0,y1:0,x2:0,y2:1,
                stop:0 rgba(255,255,255,0.88),
                stop:1 rgba(234,240,254,0.48)
            );
            border:1px solid rgba(190,202,230,0.62);
        }}
        QPushButton:hover{{
            color:rgba(0,0,0,0.94);
            border:1px solid rgba(210,220,245,0.82);
            background: qlineargradient(x1:0,y1:0,x2:0,y2:1,
                stop:0 rgba(255,255,255,0.94),
                stop:1 rgba(226,236,255,0.62)
            );
        }}
        QPushButton:pressed{{
            color:rgba(0,0,0,0.80);
            border:1px solid rgba(190,198,220,0.82);
            background: qlineargradient(x1:0,y1:0,x2:0,y2:1,
                stop:0 rgba(234,236,244,0.70),
                stop:1 rgba(214,220,236,0.46)
            );
        }}
        QPushButton:disabled{{
            color:rgba(28,28,30,0.35);
            background: rgba(255,255,255,0.20);
            border:1px solid rgba(255,255,255,0.24);
        }}
        QPushButton#Primary{{
            color:rgba(255,255,255,0.98);
            border:1px solid rgba(255,255,255,0.92);
            background: qlineargradient(x1:0,y1:0,x2:1,y2:1,
                stop:0 rgba({Theme.A1.red()},{Theme.A1.green()},{Theme.A1.blue()},0.96),
                stop:0.5 rgba({Theme.A2.red()},{Theme.A2.green()},{Theme.A2.blue()},0.94),
                stop:1 rgba({Theme.A3.red()},{Theme.A3.green()},{Theme.A3.blue()},0.88)
            );
        }}
        QPushButton#Primary:hover{{
            background: qlineargradient(x1:0,y1:0,x2:1,y2:1,
                stop:0 rgba({Theme.A1.red()},{Theme.A1.green()},{Theme.A1.blue()},1.00),
                stop:0.5 rgba({Theme.A2.red()},{Theme.A2.green()},{Theme.A2.blue()},0.98),
                stop:1 rgba({Theme.A3.red()},{Theme.A3.green()},{Theme.A3.blue()},0.96)
            );
        }}
        QPushButton#Primary:pressed{{
            background: qlineargradient(x1:0,y1:0,x2:1,y2:1,
                stop:0 rgba({Theme.A1.red()},{Theme.A1.green()},{Theme.A1.blue()},0.76),
                stop:0.5 rgba({Theme.A2.red()},{Theme.A2.green()},{Theme.A2.blue()},0.74),
                stop:1 rgba({Theme.A3.red()},{Theme.A3.green()},{Theme.A3.blue()},0.70)
            );
        }}
        QPushButton#Primary:disabled{{
            color:rgba(255,255,255,0.55);
            border:1px solid rgba(255,255,255,0.35);
            background: qlineargradient(x1:0,y1:0,x2:1,y2:1,
                stop:0 rgba({Theme.A1.red()},{Theme.A1.green()},{Theme.A1.blue()},0.28),
                stop:1 rgba({Theme.A2.red()},{Theme.A2.green()},{Theme.A2.blue()},0.28)
            );
        }}
        QPushButton#Secondary{{
            color:rgba(20,22,32,0.92);
            background: qlineargradient(x1:0,y1:0,x2:1,y2:1,
                stop:0 rgba(255,255,255,0.58),
                stop:1 rgba(226,232,245,0.40)
            );
            border:1px solid rgba(220,228,245,0.72);
        }}
        QPushButton#Secondary:hover{{
            color:rgba(0,0,0,0.96);
            background: qlineargradient(x1:0,y1:0,x2:1,y2:1,
                stop:0 rgba(255,255,255,0.68),
                stop:1 rgba(220,230,248,0.52)
            );
        }}
        QPushButton#Secondary:pressed{{
            color:rgba(0,0,0,0.78);
            background: qlineargradient(x1:0,y1:0,x2:1,y2:1,
                stop:0 rgba(238,242,250,0.44),
                stop:1 rgba(216,224,240,0.32)
            );
        }}
        QFrame#CenterPopup{{
            background: rgba(20,24,33,0.84);
            border-radius:18px;
        }}
        QFrame#CenterPopup QLabel{{
            color: rgba(255,255,255,0.98);
            font-size:15px;
            letter-spacing:0.6px;
        }}
        """)

    @staticmethod
    def elevate_button(btn: QPushButton, blur: int = 24, y_offset: int = 6, alpha: int = 65):
        effect = QGraphicsDropShadowEffect(btn)
        effect.setBlurRadius(blur)
        effect.setOffset(0, y_offset)
        effect.setColor(QColor(15, 23, 42, alpha))
        btn.setGraphicsEffect(effect)
        btn.setCursor(Qt.CursorShape.PointingHandCursor)

    @staticmethod
    def frost_field(field: QWidget, blur: int = 24, y_offset: int = 3, alpha: int = 48):
        effect = QGraphicsDropShadowEffect(field)
        effect.setBlurRadius(blur)
        effect.setOffset(0, y_offset)
        effect.setColor(QColor(15, 23, 42, alpha))
        field.setGraphicsEffect(effect)

# ======================= 小组件 =======================
def make_eye_icon(open_eye: bool, accent: QColor, size: int = 18) -> QIcon:
    pm = QPixmap(size, size)
    pm.fill(Qt.GlobalColor.transparent)
    painter = QPainter(pm)
    painter.setRenderHint(QPainter.RenderHint.Antialiasing)

    rim = QColor(accent)
    rim.setAlpha(235)
    glow = QColor(accent)
    glow.setAlpha(90)

    rect = QRectF(1.2, size * 0.32, size - 2.4, size * 0.36)
    path = QPainterPath()
    path.addEllipse(rect)

    painter.setPen(Qt.PenStyle.NoPen)
    painter.setBrush(glow)
    painter.drawEllipse(QRectF(rect).adjusted(-1.2, -1.8, 1.2, 1.8))

    painter.setPen(QColor(rim))
    painter.setBrush(Qt.BrushStyle.NoBrush)
    painter.drawPath(path)

    if open_eye:
        pupil = QColor(rim)
        pupil.setAlpha(245)
        radius = size * 0.22
        center = QPoint(int(size / 2), int(size * 0.50))
        painter.setBrush(pupil)
        painter.setPen(Qt.PenStyle.NoPen)
        painter.drawEllipse(center, int(radius * 0.38), int(radius * 0.38))
    else:
        painter.setPen(QColor(rim))
        painter.drawLine(
            int(size * 0.22), int(size * 0.70),
            int(size * 0.78), int(size * 0.30)
        )

    painter.end()
    return QIcon(pm)


class EyeToggleButton(QToolButton):
    def __init__(self, parent=None, size: int = 18):
        super().__init__(parent)
        self._base_icon_size = QSize(size, size)
        self._hover = False
        self.setCheckable(True)
        self.setCursor(Qt.CursorShape.PointingHandCursor)
        self.setAutoRaise(True)
        self.setFocusPolicy(Qt.FocusPolicy.NoFocus)
        self.setIconSize(self._base_icon_size)
        self.setFixedSize(size + 18, size + 12)
        self.setStyleSheet("QToolButton{border:none;background:transparent;padding:0;}")

        self._bounce = QPropertyAnimation(self, b"iconSize", self)
        self._bounce.setDuration(180)
        self._bounce.setEasingCurve(QEasingCurve.Type.OutBack)

        self.toggled.connect(self._on_toggled)
        self._refresh_icon()

    def enterEvent(self, e: QEvent):
        self._hover = True
        self._refresh_icon()
        super().enterEvent(e)

    def leaveEvent(self, e: QEvent):
        self._hover = False
        self._refresh_icon()
        super().leaveEvent(e)

    def _accent_color(self) -> QColor:
        if self.isChecked():
            base = Theme.A3
        else:
            base = Theme.A1
        color = QColor(base)
        if self._hover:
            color = color.lighter(115)
        return color

    def _refresh_icon(self):
        accent = self._accent_color()
        icon = make_eye_icon(not self.isChecked(), accent)
        self.setIcon(icon)
        self.setToolTip("显示" if self.isChecked() else "隐藏")

    def _on_toggled(self, _state: bool):
        self._refresh_icon()
        self._play_bounce()

    def _play_bounce(self):
        if self._bounce.state() == QPropertyAnimation.State.Running:
            self._bounce.stop()
        enlarged = QSize(self._base_icon_size.width() + 4, self._base_icon_size.height() + 4)
        self._bounce.setStartValue(self._base_icon_size)
        self._bounce.setKeyValueAt(0.5, enlarged)
        self._bounce.setEndValue(self._base_icon_size)
        self._bounce.start()


class PasswordLineEdit(QLineEdit):
    toggled = pyqtSignal(bool)

    def __init__(self, parent=None):
        super().__init__(parent)
        self._eye = EyeToggleButton(self)
        self._eye.toggled.connect(self._on_toggle)
        self._update_margins()
        self.setEchoMode(QLineEdit.EchoMode.Normal)

    def _update_margins(self):
        margin = self._eye.width() + 6
        self.setTextMargins(14, 0, margin, 0)
        self._position_eye()

    def resizeEvent(self, e):
        super().resizeEvent(e)
        self._position_eye()

    def _position_eye(self):
        size = self._eye.size()
        x = self.width() - size.width() - 6
        y = (self.height() - size.height()) // 2
        self._eye.move(x, max(0, y))

    def _on_toggle(self, hidden: bool):
        self.setEchoMode(QLineEdit.EchoMode.Password if hidden else QLineEdit.EchoMode.Normal)
        self.toggled.emit(hidden)

    def showEvent(self, e):
        super().showEvent(e)
        self._position_eye()

    def set_hidden(self, hidden: bool):
        if self._eye.isChecked() == hidden:
            self._on_toggle(hidden)
        else:
            self._eye.setChecked(hidden)

class AnimatedBar(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setFixedHeight(2)
        self.t = 0.0
        self._timer = QTimer(self)
        self._timer.setInterval(28)
        self._timer.timeout.connect(self._tick)
        self._timer.start()
    def _tick(self):
        self.t = (self.t + 0.006) % 1.0
        self.update()
    def paintEvent(self, e):
        p = QPainter(self)
        g = QLinearGradient(0, 0, self.width(), 0)
        ofs = self.t
        g.setColorAt(max(0.0, ofs - 0.25), Theme.A1)
        g.setColorAt(ofs, Theme.A2)
        g.setColorAt(min(1.0, ofs + 0.25), Theme.A3)
        p.fillRect(self.rect(), g)


class LoadingSpinner(QWidget):
    def __init__(self, parent=None, diameter: int = 72):
        super().__init__(parent)
        self._diameter = max(32, diameter)
        self._angle = 0
        self.setFixedSize(self._diameter, self._diameter)
        self._timer = QTimer(self)
        self._timer.setInterval(18)
        self._timer.timeout.connect(self._tick)
        self._timer.start()

    def _tick(self):
        self._angle = (self._angle + 6) % 360
        self.update()

    def paintEvent(self, _event):
        painter = QPainter(self)
        painter.setRenderHint(QPainter.RenderHint.Antialiasing)
        rect = self.rect().adjusted(6, 6, -6, -6)
        gradient = QConicalGradient(rect.center(), -self._angle)
        gradient.setColorAt(0.0, Theme.A1)
        gradient.setColorAt(0.33, Theme.A2)
        gradient.setColorAt(0.66, Theme.A3)
        gradient.setColorAt(1.0, QColor(255, 255, 255, 18))
        pen = QPen()
        pen.setWidth(6)
        pen.setCapStyle(Qt.PenCapStyle.RoundCap)
        pen.setBrush(gradient)
        painter.setPen(pen)
        painter.setBrush(Qt.BrushStyle.NoBrush)
        painter.drawArc(rect, 0, 270 * 16)


class LoadingDialog(QDialog):
    RADIUS = 14.0

    def __init__(self, parent: QWidget = None):
        super().__init__(parent)
        self.setWindowFlags(Qt.WindowType.FramelessWindowHint | Qt.WindowType.Dialog)
        self.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground, True)
        self.setModal(True)

        outer = QVBoxLayout(self)
        outer.setContentsMargins(0, 0, 0, 0)

        container = QFrame(self)
        container.setObjectName("Card")
        container.setProperty("class", "Card")
        outer.addWidget(container)

        layout = QVBoxLayout(container)
        layout.setContentsMargins(24, 24, 24, 24)
        layout.setSpacing(18)

        spinner = LoadingSpinner(container)
        spinner.setSizePolicy(QSizePolicy.Policy.Fixed, QSizePolicy.Policy.Fixed)
        layout.addStretch(1)
        layout.addWidget(spinner, 0, Qt.AlignmentFlag.AlignHCenter)

        text = QLabel("加载中，请稍等", container)
        text.setAlignment(Qt.AlignmentFlag.AlignHCenter)
        text.setObjectName("Sub")
        text.setStyleSheet("font-size:15pt;font-weight:600;")
        layout.addWidget(text)
        layout.addStretch(1)

        self._spinner = spinner

    def update_mask(self):
        if self.width() <= 0 or self.height() <= 0:
            return
        r = self.rect().adjusted(0, 0, -1, -1)
        path = QPainterPath()
        path.addRoundedRect(QRectF(r), self.RADIUS, self.RADIUS)
        region = QRegion(path.toFillPolygon().toPolygon())
        if not region.isEmpty():
            self.setMask(region)

    def resizeEvent(self, e):
        super().resizeEvent(e)
        self.update_mask()

    def paintEvent(self, _event):
        painter = QPainter(self)
        painter.setRenderHint(QPainter.RenderHint.Antialiasing)
        painter.setPen(Qt.PenStyle.NoPen)
        painter.fillRect(self.rect(), Qt.GlobalColor.transparent)
        r = self.rect().adjusted(0, 0, -1, -1)
        path = QPainterPath()
        path.addRoundedRect(QRectF(r), self.RADIUS, self.RADIUS)
        painter.fillPath(path, Theme.BG)

# ======================= 激活对话框 =======================
class TitleButton(QPushButton):
    def __init__(self, kind: str, parent=None):
        super().__init__(parent)
        self.kind = kind
        self._hover = False
        self._pressed = False
        self.setFixedSize(28, 28)
        self.setCursor(Qt.CursorShape.PointingHandCursor)
        self.setFocusPolicy(Qt.FocusPolicy.NoFocus)
        self.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground, True)

    def enterEvent(self, e):
        self._hover = True
        self.update()
        super().enterEvent(e)

    def leaveEvent(self, e):
        self._hover = False
        self._pressed = False
        self.update()
        super().leaveEvent(e)

    def mousePressEvent(self, e):
        if e.button() == Qt.MouseButton.LeftButton:
            self._pressed = True
            self.update()
        super().mousePressEvent(e)

    def mouseReleaseEvent(self, e):
        if self._pressed:
            self._pressed = False
            self.update()
        super().mouseReleaseEvent(e)

    def _base_color(self) -> QColor:
        if self.kind == "min":
            return QColor(255, 185, 90)
        return QColor(255, 98, 110)

    def _icon_pen(self) -> QPen:
        pen = QPen(QColor(255, 255, 255, 235))
        pen.setCapStyle(Qt.PenCapStyle.RoundCap)
        pen.setJoinStyle(Qt.PenJoinStyle.RoundJoin)
        pen.setWidthF(2.2)
        return pen

    def paintEvent(self, e):
        painter = QPainter(self)
        painter.setRenderHint(QPainter.RenderHint.Antialiasing)
        outer = QRectF(self.rect()).adjusted(3.0, 3.0, -3.0, -3.0)
        diameter = min(outer.width(), outer.height())
        circle = QRectF(0.0, 0.0, diameter, diameter)
        circle.moveCenter(outer.center())

        base = self._base_color()
        highlight = QColor(base)
        shadow = QColor(base)
        if self._pressed:
            highlight = highlight.darker(130)
            shadow = shadow.darker(160)
        elif self._hover:
            highlight = highlight.lighter(145)
            shadow = shadow.darker(130)
        else:
            highlight = highlight.lighter(130)
            shadow = shadow.darker(140)

        grad = QRadialGradient(circle.center(), diameter / 2.0)
        grad.setColorAt(0.0, highlight)
        grad.setColorAt(0.65, base)
        grad.setColorAt(1.0, shadow)

        painter.setPen(Qt.PenStyle.NoPen)
        painter.setBrush(grad)
        painter.drawEllipse(circle)

        rim = QColor(shadow)
        rim.setAlpha(210)
        painter.setPen(QPen(rim, 1.1))
        painter.setBrush(Qt.BrushStyle.NoBrush)
        painter.drawEllipse(circle.adjusted(0.3, 0.3, -0.3, -0.3))

        painter.setPen(self._icon_pen())
        if self.kind == "min":
            y = circle.center().y()
            painter.drawLine(QPointF(circle.left() + 6.5, y), QPointF(circle.right() - 6.5, y))
        else:
            painter.drawLine(QPointF(circle.left() + 6.5, circle.top() + 6.5), QPointF(circle.right() - 6.5, circle.bottom() - 6.5))
            painter.drawLine(QPointF(circle.left() + 6.5, circle.bottom() - 6.5), QPointF(circle.right() - 6.5, circle.top() + 6.5))


class TitleBar(QWidget):
    def __init__(self, parent, title="设备授权"):
        super().__init__(parent)
        self.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Fixed)
        self.setMaximumHeight(42)
        self.drag = None
        self.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground, True)
        self.setStyleSheet("background: transparent;")
        self.lab = QLabel(title); self.lab.setObjectName("Sub")
        self.btn_min = TitleButton("min", self)
        self.btn_x   = TitleButton("close", self)
        for btn, tip in ((self.btn_min, "最小化"), (self.btn_x, "关闭")):
            btn.setToolTip(tip)
        row = QHBoxLayout(self); row.setContentsMargins(18, 8, 18, 6); row.setSpacing(12)
        row.addWidget(self.lab); row.addStretch(1); row.addWidget(self.btn_min); row.addWidget(self.btn_x)
        self.btn_min.clicked.connect(parent.showMinimized); self.btn_x.clicked.connect(parent.close)
    def paintEvent(self, e):
        super().paintEvent(e)
    def mousePressEvent(self, e):
        if e.button() == Qt.MouseButton.LeftButton:
            self.drag = e.globalPosition().toPoint() - self.window().frameGeometry().topLeft(); e.accept()
    def mouseMoveEvent(self, e):
        if self.drag and (e.buttons() & Qt.MouseButton.LeftButton):
            self.window().move(e.globalPosition().toPoint() - self.drag); e.accept()
    def mouseReleaseEvent(self, e):
        self.drag = None; e.accept()

class Banner(QLabel):
    def show_msg(self, text: str, ok=True):
        self.setText(text)
        c = Theme.OK if ok else Theme.BAD
        self.setObjectName("Banner")
        self.setStyleSheet(
            f"QLabel#Banner{{background:rgba({c.red()},{c.green()},{c.blue()},220);color:white;}}"
        )
        self.show()
        self.setWindowOpacity(0.0)
        ani = QPropertyAnimation(self, b"windowOpacity", self)
        ani.setDuration(120)
        ani.setStartValue(0.0)
        ani.setEndValue(1.0)
        ani.start(QPropertyAnimation.DeletionPolicy.DeleteWhenStopped)

# ======================= 激活对话框 =======================
class CenterPopup(QFrame):
    def __init__(self, parent: Optional[QWidget] = None):
        super().__init__(parent)
        self.setObjectName("CenterPopup")
        self.setAttribute(Qt.WidgetAttribute.WA_TransparentForMouseEvents, True)
        self.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)
        self.setVisible(False)
        self.setMinimumWidth(220)
        self.setMaximumWidth(360)
        self.setSizePolicy(QSizePolicy.Policy.Maximum, QSizePolicy.Policy.Maximum)

        layout = QHBoxLayout(self)
        layout.setContentsMargins(28, 18, 28, 18)
        self.label = QLabel("", self)
        self.label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.label.setWordWrap(True)
        layout.addWidget(self.label)

        shadow = QGraphicsDropShadowEffect(self.label)
        shadow.setBlurRadius(36)
        shadow.setOffset(0, 8)
        shadow.setColor(QColor(15, 23, 42, 150))
        self.label.setGraphicsEffect(shadow)

        self._opacity = QGraphicsOpacityEffect(self)
        self._opacity.setOpacity(0.0)
        self.setGraphicsEffect(self._opacity)

        self._fade = QPropertyAnimation(self._opacity, b"opacity", self)
        self._fade.finished.connect(self._on_fade_finished)
        self._timer = QTimer(self)
        self._timer.setSingleShot(True)
        self._timer.timeout.connect(self._start_fade_out)
        self._is_hiding = False

        if parent:
            parent.installEventFilter(self)

    def eventFilter(self, obj, event):
        if obj is self.parent() and self.isVisible() and event.type() in (QEvent.Type.Resize, QEvent.Type.Move):
            self._center()
        return super().eventFilter(obj, event)

    def _center(self):
        parent = self.parentWidget()
        if not parent:
            return
        geo = parent.rect()
        x = max(0, int((geo.width() - self.width()) / 2))
        y = max(0, int((geo.height() - self.height()) / 2))
        self.move(x, y)

    def show_message(self, text: str, duration: int = 3000):
        self.label.setText(text)
        self.adjustSize()
        self._center()
        self.raise_()
        self._timer.stop()
        self._fade.stop()
        self._is_hiding = False
        self._opacity.setOpacity(0.0)
        self.show()
        self._fade.setDuration(160)
        self._fade.setStartValue(0.0)
        self._fade.setEndValue(1.0)
        self._fade.start()
        self._timer.start(max(0, duration))

    def _start_fade_out(self):
        if self._is_hiding:
            return
        self._fade.stop()
        self._is_hiding = True
        self._fade.setDuration(240)
        self._fade.setStartValue(self._opacity.opacity())
        self._fade.setEndValue(0.0)
        self._fade.start()

    def _on_fade_finished(self):
        if self._is_hiding:
            self.hide()
            self._opacity.setOpacity(0.0)


class ActivateDialog(QDialog):
    RADIUS = 14.0  # 圆角半径（逻辑像素）

    def __init__(self, mc_display: str, mc_raw: str, parent: QWidget = None):
        super().__init__(parent)
        self.setWindowFlags(Qt.WindowType.FramelessWindowHint | Qt.WindowType.Dialog)
        self.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground, True)
        self.setModal(True)
        self.mc_display = mc_display
        self.mc_raw = mc_raw
        self.expires_at: Optional[date] = None
        self.canonical_code: Optional[str] = None

        # 外层布局（边距=0，卡片铺满圆角，不留黑圈）
        outer = QVBoxLayout(self); outer.setContentsMargins(0, 0, 0, 0)

        container = QFrame(self); container.setObjectName("Card"); container.setProperty("class", "Card")
        outer.addWidget(container)

        # 卡片内部留白
        card = QVBoxLayout(container); card.setContentsMargins(22, 16, 22, 18); card.setSpacing(10)

        # 标题栏 / 光带 / 横幅
        self.titlebar = TitleBar(self, "设备授权"); card.addWidget(self.titlebar)
        self.bar = AnimatedBar(); card.addWidget(self.bar)
        self.banner = Banner(""); self.banner.hide(); card.addWidget(self.banner)

        # 标题与说明
        h1 = QLabel("设备授权"); h1.setObjectName("H1")
        sub = QLabel("请复制本机机器码并联系管理员生成含有效期的激活码。"); sub.setObjectName("Sub"); sub.setWordWrap(True)
        card.addWidget(h1); card.addWidget(sub)

        # 表单
        form = QGridLayout(); form.setHorizontalSpacing(10); form.setVerticalSpacing(6); card.addLayout(form)

        # —— 机器码 —— #
        lab_mc = QLabel("机器码"); lab_mc.setObjectName("Sub")
        self.ed_mc = QLineEdit(); self.ed_mc.setReadOnly(True); self.ed_mc.setText(self.mc_display); self.ed_mc.setCursorPosition(0)
        self.ed_mc.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Fixed)
        Theme.frost_field(self.ed_mc, blur=30, y_offset=2, alpha=56)
        self.btn_copy = QPushButton("复制"); self.btn_copy.setObjectName("Secondary")
        self.btn_copy.setMinimumWidth(96)
        self.btn_copy.setSizePolicy(QSizePolicy.Policy.Fixed, QSizePolicy.Policy.Fixed); self.btn_copy.clicked.connect(self.copy_mc)
        Theme.elevate_button(self.btn_copy, blur=20, y_offset=4, alpha=68)
        hint = QLabel("机器码示例：XXXX-XXXX-XXXX-XXXX，复制后交由管理员生成激活码。"); hint.setObjectName("Hint"); hint.setWordWrap(True)

        form.addWidget(lab_mc,    0, 0, 1, 1)
        form.addWidget(self.ed_mc,0, 1, 1, 4)
        form.addWidget(self.btn_copy, 0, 5, 1, 1)
        form.addWidget(hint,      1, 1, 1, 5)

        # —— 激活码（右侧内嵌眼睛） —— #
        lab_cd = QLabel("激活码"); lab_cd.setObjectName("Sub")
        self.ed_code = PasswordLineEdit(); self.ed_code.setPlaceholderText("请输入激活码（YYYYMMDD-XXXX-XXXX-XXXX-XXXX）")
        self.ed_code.textChanged.connect(self.on_code_change)
        self.ed_code.returnPressed.connect(self.on_accept)
        self.ed_code.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Fixed)
        self.ed_code.set_hidden(True)
        Theme.frost_field(self.ed_code, blur=30, y_offset=2, alpha=64)

        lm, _tm, rm, _bm = self.ed_code.getTextMargins()
        self.ed_mc.setTextMargins(lm, 0, rm, 0)

        # 右侧粘贴按钮（外部）
        self.btn_paste = QPushButton("粘贴"); self.btn_paste.setObjectName("Secondary")
        self.btn_paste.setMinimumWidth(96)
        self.btn_paste.setSizePolicy(QSizePolicy.Policy.Fixed, QSizePolicy.Policy.Fixed); self.btn_paste.clicked.connect(self.paste_code)
        Theme.elevate_button(self.btn_paste, blur=20, y_offset=4, alpha=68)

        form.addWidget(lab_cd,       2, 0, 1, 1)
        form.addWidget(self.ed_code, 2, 1, 1, 4)
        form.addWidget(self.btn_paste, 2, 5, 1, 1)

        hint_code = QLabel("激活码由管理员按照有效期生成：YYYYMMDD-XXXX-XXXX-XXXX-XXXX。")
        hint_code.setObjectName("Hint")
        hint_code.setWordWrap(True)
        form.addWidget(hint_code, 3, 1, 1, 5)

        form.setColumnStretch(1, 6)
        form.setColumnMinimumWidth(5, 104)

        # 操作区
        actions = QHBoxLayout(); actions.setSpacing(10); actions.addStretch(1)
        self.btn_cancel = QPushButton("取消"); self.btn_cancel.setObjectName("Secondary"); self.btn_cancel.clicked.connect(self.reject)
        Theme.elevate_button(self.btn_cancel, blur=24, y_offset=5, alpha=70)
        self.btn_ok = QPushButton("完成授权"); self.btn_ok.setObjectName("Primary"); self.btn_ok.clicked.connect(self.on_accept)
        Theme.elevate_button(self.btn_ok, blur=32, y_offset=7, alpha=90)
        self.btn_ok.setEnabled(False); actions.addWidget(self.btn_cancel); actions.addWidget(self.btn_ok)
        card.addLayout(actions)

        # 尺寸与圆角掩码
        self.setMinimumSize(520, 320); self.adjustSize()
        self.update_mask()
        self.copy_popup = CenterPopup(self)
        self._error_popup = None

        # 入场轻浮动
        container.move(container.x(), container.y() + 8)
        ani = QPropertyAnimation(container, b"pos", self)
        ani.setDuration(220); ani.setStartValue(container.pos())
        ani.setEndValue(QPoint(container.x(), container.y() - 8))
        ani.setEasingCurve(QEasingCurve.Type.OutCubic)
        ani.start(QPropertyAnimation.DeletionPolicy.DeleteWhenStopped)

    # ========= 圆角掩码 =========
    def update_mask(self):
        if self.width() <= 0 or self.height() <= 0:
            return
        r = self.rect().adjusted(0, 0, -1, -1)
        path = QPainterPath(); path.addRoundedRect(QRectF(r), self.RADIUS, self.RADIUS)
        region = QRegion(path.toFillPolygon().toPolygon())
        if not region.isEmpty():
            self.setMask(region)

    def resizeEvent(self, e):
        super().resizeEvent(e); self.update_mask()

    def paintEvent(self, e):
        p = QPainter(self)
        p.setRenderHint(QPainter.RenderHint.Antialiasing)
        p.setPen(Qt.PenStyle.NoPen)
        p.fillRect(self.rect(), Qt.GlobalColor.transparent)
        r = self.rect().adjusted(0, 0, -1, -1)
        path = QPainterPath(); path.addRoundedRect(QRectF(r), self.RADIUS, self.RADIUS)
        p.fillPath(path, Theme.BG)

    # —— 交互逻辑 —— #
    def _shake(self, w: QWidget):
        ani = QPropertyAnimation(w, b"pos", self)
        ani.setDuration(220)
        ox, oy = w.x(), w.y()
        ani.setKeyValueAt(0.0, QPoint(ox, oy))
        ani.setKeyValueAt(0.25, QPoint(ox - 5, oy))
        ani.setKeyValueAt(0.50, QPoint(ox + 5, oy))
        ani.setKeyValueAt(0.75, QPoint(ox - 3, oy))
        ani.setKeyValueAt(1.0,  QPoint(ox, oy))
        ani.start(QPropertyAnimation.DeletionPolicy.DeleteWhenStopped)

    def copy_mc(self):
        QApplication.clipboard().setText(self.mc_display, QClipboard.Mode.Clipboard)
        self.banner.hide()
        self.copy_popup.show_message("机器码已复制", duration=3000)

    def _show_error_popup(self, text: str):
        if self._error_popup is not None:
            self._error_popup.close()
            self._error_popup = None
        msg = QMessageBox(self)
        msg.setIcon(QMessageBox.Icon.Warning)
        msg.setWindowTitle("激活失败")
        msg.setText(text)
        msg.setStandardButtons(QMessageBox.StandardButton.NoButton)
        msg.setWindowModality(Qt.WindowModality.WindowModal)
        msg.setAttribute(Qt.WidgetAttribute.WA_DeleteOnClose, True)
        msg.show()
        QTimer.singleShot(4000, msg.close)
        msg.destroyed.connect(lambda: setattr(self, "_error_popup", None))
        self._error_popup = msg

    def paste_code(self):
        text = QApplication.clipboard().text(QClipboard.Mode.Clipboard)
        self.ed_code.setText((text or "").strip())

    def on_code_change(self, s: str):
        current = s or ""
        upper = current.upper()
        if upper != current:
            pos = self.ed_code.cursorPosition()
            self.ed_code.blockSignals(True)
            self.ed_code.setText(upper)
            self.ed_code.setCursorPosition(pos)
            self.ed_code.blockSignals(False)
            current = upper
        cleaned = "".join(ch for ch in current if ch.isalnum())
        self.btn_ok.setEnabled(len(cleaned) >= 24)
        self.banner.hide()

    def on_accept(self):
        code = (self.ed_code.text() or "").strip()
        valid, expiry, canonical, error = verify_activation_code(self.mc_raw, code)
        if not valid:
            msg = error or "激活码不正确，请核对后再试。"
            self.banner.show_msg(msg, ok=False)
            self._show_error_popup(msg)
            self._shake(self)
            return
        self.expires_at = expiry
        self.canonical_code = canonical or code
        suffix = f"有效期至 {expiry.strftime('%Y-%m-%d')}"
        self.banner.show_msg(f"激活成功 ✓ {suffix}", ok=True)
        QTimer.singleShot(200, self.accept)

# ======================= 启动 iBase.exe =======================
def start_ibase_exe() -> int:
    exe = str(IBASE_EXE_PATH)
    if not os.path.isfile(exe):
        # 找不到可执行文件才用 Toast，避免无界面
        w = QWidget(); w.hide()
        t = Toast(w, "未找到 iBase.exe", Theme.BAD); t.show_at(40, 40)
        return 1
    ok, _pid = QProcess.startDetached(exe, [])
    if not ok:
        try:
            subprocess.Popen([exe], shell=False)
            return 0
        except Exception:
            return 2
    return 0


def launch_with_loader(app: QApplication) -> int:
    loader = LoadingDialog()
    loader.show()
    app.processEvents()
    status = start_ibase_exe()
    start_time = time.time()
    while loader.isVisible() and time.time() - start_time < 1.0:
        app.processEvents()
        time.sleep(0.05)
    loader.close()
    return status

# ======================= 主流程 =======================
def _safe_set_attr(name: str, value: bool = True):
    try:
        attr = getattr(Qt.ApplicationAttribute, name)
        QApplication.setAttribute(attr, value)
    except AttributeError:
        pass

def main():
    _safe_set_attr("AA_EnableHighDpiScaling", True)
    _safe_set_attr("AA_UseHighDpiPixmaps", True)

    app = QApplication(sys.argv)
    Theme.apply(app)

    cfg = load_config()
    mc_raw = get_machine_code_raw()
    mc_display = _format_groups(mc_raw)

    activated = False
    cfg_changed = False
    activation_error: Optional[str] = None
    bind = cfg.get("bind")
    if not isinstance(bind, dict):
        bind = {}
        cfg["bind"] = bind
        cfg_changed = True

    stored_mc = str(bind.get("machine_code") or "")
    stored_code = bind.get("activation_code")
    if cfg.get("activated") and stored_mc and stored_code:
        if normalize_machine_code(stored_mc) == mc_raw:
            ok, expiry_candidate, canonical_code, error = verify_activation_code(mc_raw, str(stored_code))
            if ok:
                activated = True
                if canonical_code and canonical_code != stored_code:
                    bind["activation_code"] = canonical_code
                    cfg_changed = True
                if expiry_candidate:
                    expires_key = expiry_candidate.strftime("%Y%m%d")
                    if bind.get("expires_at") != expires_key:
                        bind["expires_at"] = expires_key
                        cfg_changed = True
            else:
                activation_error = error
        else:
            activation_error = "检测到机器码发生变化，请重新激活。"

    if not activated and cfg.get("activated"):
        cfg["activated"] = False
        cfg_changed = True

    if not activated:
        dlg = ActivateDialog(mc_display, mc_raw)
        if activation_error:
            dlg.banner.show_msg(activation_error, ok=False)
        if dlg.exec() != QDialog.DialogCode.Accepted:
            return 0
        activated = True
        cfg["activated"] = True
        code_to_store = dlg.canonical_code or (dlg.ed_code.text() or "").strip()
        cfg["bind"] = {
            "machine_code": mc_raw,
            "activation_code": code_to_store,
        }
        if dlg.expires_at:
            cfg["bind"]["expires_at"] = dlg.expires_at.strftime("%Y%m%d")
        cfg_changed = True

    if cfg_changed:
        save_config(cfg)

    return launch_with_loader(app)

if __name__ == "__main__":
    sys.exit(main())
