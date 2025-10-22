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
import time
import uuid
import hashlib
import platform
import subprocess
from pathlib import Path
from typing import Optional, Tuple

from PyQt6.QtCore import (
    Qt, QTimer, QPoint, QPointF, QRectF, QPropertyAnimation, QEasingCurve, QProcess,
    QSize, QEvent, pyqtSignal, QVariantAnimation
)
from PyQt6.QtGui import (
    QFont, QFontDatabase, QPalette, QColor, QClipboard,
    QPainter, QPainterPath, QLinearGradient, QRegion, QIcon, QPixmap, QPen,
    QRadialGradient, QGuiApplication
)
from PyQt6.QtWidgets import (
    QApplication, QDialog, QLabel, QLineEdit, QPushButton, QVBoxLayout, QHBoxLayout,
    QWidget, QFrame, QGridLayout, QSizePolicy, QGraphicsDropShadowEffect, QToolButton,
    QGraphicsOpacityEffect, QWIDGETSIZE_MAX
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

# ======================= 机器码 / 激活码 =======================
MACHINE_CODE_LENGTH = 16
ACTIVATION_CODE_LENGTH = 16
EXPIRY_SEGMENT_LENGTH = 8
HEX_DIGITS = "0123456789ABCDEF"


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

def _sanitize_machine_code(raw: str) -> str:
    raw = (raw or "").upper()
    filtered = [ch for ch in raw if ch in HEX_DIGITS]
    return "".join(filtered)[:MACHINE_CODE_LENGTH].ljust(MACHINE_CODE_LENGTH, "0")


def format_machine_code(raw: str) -> str:
    cleaned = _sanitize_machine_code(raw)
    return "-".join(cleaned[i:i + 4] for i in range(0, len(cleaned), 4))


def get_machine_code() -> str:
    parts = []
    if os.name == "nt":
        g = _win_machine_guid()
        if g: parts.append(g)
        u = _wmic_uuid()
        if u: parts.append(u)
    parts += [platform.node(), platform.system(), platform.release(),
              platform.version(), _mac_hex() or "UNKNOWNMAC"]
    raw = "|".join([p for p in parts if p])
    digest = hashlib.sha1(raw.encode("utf-8")).hexdigest().upper()
    return digest[:MACHINE_CODE_LENGTH]


def _activation_signature(mc: str, expiry_hex: str) -> str:
    payload = f"{mc}{expiry_hex}{SECRET_KEY}"
    sig_len = ACTIVATION_CODE_LENGTH - len(expiry_hex)
    return hashlib.sha256(payload.encode("utf-8")).hexdigest().upper()[:sig_len]


def normalize_activation_code(code: str) -> str:
    return "".join(ch for ch in (code or "").upper() if ch in HEX_DIGITS)


def calc_activation_code(mc: str, expires_at: int) -> str:
    """生成 16 位激活码：前 8 位为到期 Unix 时间戳（十六进制），后 8 位为签名。"""
    expiry_hex = f"{max(0, int(expires_at)):0{EXPIRY_SEGMENT_LENGTH}X}"[-EXPIRY_SEGMENT_LENGTH:]
    signature = _activation_signature(mc, expiry_hex)
    return (expiry_hex + signature)[:ACTIVATION_CODE_LENGTH]


def verify_activation_code(mc: str, code: str) -> Tuple[bool, Optional[int], Optional[str], str]:
    normalized = normalize_activation_code(code)
    if len(normalized) != ACTIVATION_CODE_LENGTH:
        return False, None, "激活码格式不正确，请确认后重新输入。", normalized
    expiry_hex = normalized[:EXPIRY_SEGMENT_LENGTH]
    try:
        expires_at = int(expiry_hex, 16)
    except ValueError:
        return False, None, "激活码格式不正确，请确认后重新输入。", normalized
    expected = calc_activation_code(mc, expires_at)
    if normalized != expected:
        return False, None, "激活码不正确，请核对后再试。", normalized
    now = int(time.time())
    if expires_at < now:
        return False, expires_at, "激活码已过期，请联系管理员重新获取。", normalized
    return True, expires_at, None, normalized

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
            padding:8px 22px 8px 16px;
            min-height:36px;
            font-size:12.4pt;
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
            letter-spacing:.15px;
            font-size:12.4pt;
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


class SpinnerWidget(QWidget):
    def __init__(self, parent: Optional[QWidget] = None):
        super().__init__(parent)
        self._angle = 0
        self._timer = QTimer(self)
        self._timer.setInterval(80)
        self._timer.timeout.connect(self._tick)
        self._timer.start()
        self.setFixedSize(72, 72)

    def _tick(self):
        self._angle = (self._angle + 30) % 360
        self.update()

    def sizeHint(self):
        return QSize(72, 72)

    def paintEvent(self, event):
        painter = QPainter(self)
        painter.setRenderHint(QPainter.RenderHint.Antialiasing)
        rect = self.rect().adjusted(8, 8, -8, -8)
        pen = QPen(Theme.A2, 6)
        pen.setCapStyle(Qt.PenCapStyle.RoundCap)
        painter.setPen(pen)
        start_angle = int(self._angle * 16)
        span_angle = int(300 * 16)
        painter.drawArc(rect, start_angle, span_angle)


class LoadingDialog(QDialog):
    def __init__(self, parent: Optional[QWidget] = None):
        super().__init__(parent)
        self.setWindowFlags(Qt.WindowType.FramelessWindowHint | Qt.WindowType.Dialog)
        self.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground, True)
        self.setModal(True)

        outer = QVBoxLayout(self)
        outer.setContentsMargins(22, 22, 22, 22)

        card = QFrame(self)
        card.setObjectName("Card")
        card.setProperty("class", "Card")
        card_layout = QVBoxLayout(card)
        card_layout.setContentsMargins(36, 32, 36, 36)
        card_layout.setSpacing(18)

        spinner = SpinnerWidget(card)
        label = QLabel("加载中，请稍等", card)
        label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        label.setObjectName("Sub")

        card_layout.addWidget(spinner, 0, Qt.AlignmentFlag.AlignCenter)
        card_layout.addWidget(label, 0, Qt.AlignmentFlag.AlignCenter)
        outer.addWidget(card)

        Theme.frost_field(card, blur=40, y_offset=10, alpha=90)
        self.setFixedSize(self.sizeHint())

    def showEvent(self, event):
        super().showEvent(event)
        self._center()

    def resizeEvent(self, event):
        super().resizeEvent(event)
        self._center()

    def _center(self):
        parent = self.parentWidget()
        if parent:
            geo = parent.frameGeometry()
        else:
            screen = QGuiApplication.primaryScreen()
            if not screen:
                return
            geo = screen.availableGeometry()
        size = self.sizeHint()
        x = geo.x() + (geo.width() - size.width()) // 2
        y = geo.y() + (geo.height() - size.height()) // 2
        self.move(x, y)

    def sizeHint(self):
        return QSize(260, 220)

    def paintEvent(self, event):
        painter = QPainter(self)
        painter.setRenderHint(QPainter.RenderHint.Antialiasing)
        painter.setPen(Qt.PenStyle.NoPen)
        painter.fillRect(self.rect(), QColor(0, 0, 0, 0))

# ======================= 激活对话框 =======================
class TitleButton(QPushButton):
    def __init__(self, kind: str, parent=None):
        super().__init__(parent)
        self.kind = kind
        self._hover_progress = 0.0
        self._press_progress = 0.0
        self._pressed = False
        self.setFixedSize(28, 28)
        self.setCursor(Qt.CursorShape.PointingHandCursor)
        self.setFocusPolicy(Qt.FocusPolicy.NoFocus)
        self.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground, True)
        self._hover_anim = QVariantAnimation(self)
        self._hover_anim.setDuration(180)
        self._hover_anim.setEasingCurve(QEasingCurve.Type.InOutQuad)
        self._hover_anim.valueChanged.connect(self._on_hover_changed)
        self._press_anim = QVariantAnimation(self)
        self._press_anim.setDuration(140)
        self._press_anim.setEasingCurve(QEasingCurve.Type.OutCubic)
        self._press_anim.valueChanged.connect(self._on_press_changed)

    def enterEvent(self, e):
        self._animate_hover(1.0)
        super().enterEvent(e)

    def leaveEvent(self, e):
        self._pressed = False
        self._animate_hover(0.0)
        self._animate_press(0.0)
        super().leaveEvent(e)

    def mousePressEvent(self, e):
        if e.button() == Qt.MouseButton.LeftButton:
            self._pressed = True
            self._animate_press(1.0)
        super().mousePressEvent(e)

    def mouseReleaseEvent(self, e):
        if self._pressed:
            self._pressed = False
            self._animate_press(0.0)
        super().mouseReleaseEvent(e)

    def _base_color(self) -> QColor:
        if self.kind == "min":
            return QColor(228, 234, 240)
        return QColor(255, 92, 92)

    def _button_color(self) -> QColor:
        base = self._base_color()
        hover = self._hover_progress
        press = self._press_progress
        if hover > 0.0:
            base = base.lighter(100 + int(6 * hover))
        if press > 0.0:
            base = base.darker(100 + int(12 * press))
        return base

    def _icon_pen(self) -> QPen:
        if self.kind == "min":
            base = QColor(52, 60, 72, 230)
        else:
            base = QColor(255, 255, 255, 240)
        hover = self._hover_progress
        press = self._press_progress
        if hover > 0.0:
            base.setAlpha(min(255, int(base.alpha() * (1.05 + 0.2 * hover))))
        if press > 0.0:
            base.setAlpha(max(120, int(base.alpha() * (0.88 - 0.18 * press))))
        pen = QPen(base)
        pen.setCapStyle(Qt.PenCapStyle.RoundCap)
        pen.setJoinStyle(Qt.PenJoinStyle.RoundJoin)
        pen.setWidthF(2.0)
        return pen

    def _halo_gradient(self, center: QPointF, radius: float) -> Optional[Tuple[QRadialGradient, float]]:
        if self._hover_progress <= 0.0:
            return None
        glow = QColor(self._base_color())
        glow.setAlphaF(0.18 + 0.32 * self._hover_progress)
        outer = QColor(20, 26, 32, 0)
        grad = QRadialGradient(center, radius)
        grad.setColorAt(0.0, glow)
        grad.setColorAt(1.0, outer)
        return grad, radius

    def _animate_hover(self, target: float):
        self._hover_anim.stop()
        self._hover_anim.setStartValue(self._hover_progress)
        self._hover_anim.setEndValue(max(0.0, min(1.0, target)))
        self._hover_anim.start()

    def _animate_press(self, target: float):
        self._press_anim.stop()
        self._press_anim.setStartValue(self._press_progress)
        self._press_anim.setEndValue(max(0.0, min(1.0, target)))
        self._press_anim.start()

    def _on_hover_changed(self, value: float):
        self._hover_progress = float(value)
        self.update()

    def _on_press_changed(self, value: float):
        self._press_progress = float(value)
        self.update()

    def paintEvent(self, e):
        painter = QPainter(self)
        painter.setRenderHint(QPainter.RenderHint.Antialiasing)
        outer = QRectF(self.rect()).adjusted(5.0, 5.0, -5.0, -5.0)
        diameter = min(outer.width(), outer.height())
        outer.setWidth(diameter)
        outer.setHeight(diameter)
        outer.moveCenter(QPointF(self.rect().center()))
        center = outer.center()
        scale = 1.0 + (0.05 * self._hover_progress) - (0.1 * self._press_progress)

        painter.save()
        painter.translate(center)
        painter.scale(scale, scale)
        painter.translate(-center)

        halo = self._halo_gradient(center, outer.width() / 1.6)
        if halo:
            gradient, halo_radius = halo
            painter.setPen(Qt.PenStyle.NoPen)
            painter.setBrush(gradient)
            painter.drawEllipse(center, halo_radius, halo_radius)

        painter.setPen(Qt.PenStyle.NoPen)
        painter.setBrush(self._button_color())
        painter.drawEllipse(outer)

        if self._hover_progress > 0.0:
            ring = QColor(255, 255, 255, int(40 * self._hover_progress))
            painter.setPen(QPen(ring, 1.4))
            painter.setBrush(Qt.BrushStyle.NoBrush)
            painter.drawEllipse(outer.adjusted(0.5, 0.5, -0.5, -0.5))

        painter.setPen(self._icon_pen())
        if self.kind == "min":
            y = outer.center().y()
            inset = 7.0
            painter.drawLine(
                QPointF(outer.left() + inset, y),
                QPointF(outer.right() - inset, y)
            )
        else:
            inset = 6.5
            painter.drawLine(
                QPointF(outer.left() + inset, outer.top() + inset),
                QPointF(outer.right() - inset, outer.bottom() - inset)
            )
            painter.drawLine(
                QPointF(outer.left() + inset, outer.bottom() - inset),
                QPointF(outer.right() - inset, outer.top() + inset)
            )

        painter.restore()


class TitleBar(QWidget):
    def __init__(self, parent, title="iBase 激活"):
        super().__init__(parent)
        self.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Fixed)
        self.setMaximumHeight(42)
        self.drag = None
        self.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground, True)
        self.setStyleSheet("background: transparent;")
        self.lab = QLabel(title); self.lab.setObjectName("Sub")
        if not title:
            self.lab.setVisible(False)
        self.btn_min = TitleButton("min", self)
        self.btn_x   = TitleButton("close", self)
        for btn, tip in ((self.btn_min, "最小化"), (self.btn_x, "关闭")):
            btn.setToolTip(tip)
        row = QHBoxLayout(self)
        row.setContentsMargins(16, 7, 16, 7)
        row.setSpacing(10)
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
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._hide_timer = QTimer(self)
        self._hide_timer.setSingleShot(True)
        self._hide_timer.timeout.connect(self._fade_out)
        self._fade = QPropertyAnimation(self, b"windowOpacity", self)
        self._fade.setDuration(160)
        self._fade.finished.connect(self._on_fade_finished)
        self._fading_out = False
        self.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Minimum)
        self.setMinimumHeight(0)
        self.setMaximumHeight(0)

    def show_msg(self, text: str, ok=True, duration_ms: Optional[int] = None):
        self._hide_timer.stop()
        if self._fade.state() == QPropertyAnimation.State.Running:
            self._fade.stop()
        self._fading_out = False
        self.setText(text)
        c = Theme.OK if ok else Theme.BAD
        self.setObjectName("Banner")
        self.setStyleSheet(
            f"QLabel#Banner{{background:rgba({c.red()},{c.green()},{c.blue()},220);color:white;}}"
        )
        self.setMaximumHeight(QWIDGETSIZE_MAX)
        self.show()
        self.adjustSize()
        self.setWindowOpacity(0.0)
        ani = QPropertyAnimation(self, b"windowOpacity", self)
        ani.setDuration(120)
        ani.setStartValue(0.0)
        ani.setEndValue(1.0)
        ani.start(QPropertyAnimation.DeletionPolicy.DeleteWhenStopped)
        self._request_parent_resize()
        if duration_ms:
            self._hide_timer.start(max(0, duration_ms))

    def _fade_out(self):
        if not self.isVisible():
            return
        self._fading_out = True
        self._fade.stop()
        self._fade.setDuration(180)
        self._fade.setStartValue(self.windowOpacity())
        self._fade.setEndValue(0.0)
        self._fade.start()

    def _on_fade_finished(self):
        if self._fading_out:
            self._fading_out = False
            super().hide()
            self.setWindowOpacity(0.0)
            self.clear()
            self._collapse_and_update()

    def hide(self):
        self._hide_timer.stop()
        if self._fade.state() == QPropertyAnimation.State.Running:
            self._fade.stop()
        self._fading_out = False
        self.setWindowOpacity(0.0)
        super().hide()
        self.clear()
        self._collapse_and_update()

    def _collapse_and_update(self):
        self.setMinimumHeight(0)
        self.setMaximumHeight(0)
        self.updateGeometry()
        self._request_parent_resize()

    def _request_parent_resize(self):
        parent = self.parentWidget()
        if parent is None:
            return
        parent.updateGeometry()
        window = parent.window()
        if window is None:
            return
        hint = window.sizeHint()
        if hint.isValid():
            window.resize(window.width(), max(window.minimumHeight(), hint.height()))

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

    def __init__(self, mc: str, parent: QWidget = None):
        super().__init__(parent)
        self.setWindowFlags(Qt.WindowType.FramelessWindowHint | Qt.WindowType.Dialog)
        self.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground, True)
        self.setModal(True)
        self.mc = _sanitize_machine_code(mc)
        self.mc_display = format_machine_code(self.mc)
        self.activation_code: Optional[str] = None
        self.expires_at: Optional[int] = None

        # 外层布局（边距=0，卡片铺满圆角，不留黑圈）
        outer = QVBoxLayout(self); outer.setContentsMargins(0, 0, 0, 0)

        container = QFrame(self); container.setObjectName("Card"); container.setProperty("class", "Card")
        outer.addWidget(container)

        # 卡片内部留白
        card = QVBoxLayout(container); card.setContentsMargins(22, 16, 22, 18); card.setSpacing(10)

        # 标题栏 / 光带 / 横幅
        self.titlebar = TitleBar(self, ""); card.addWidget(self.titlebar)
        self.bar = AnimatedBar(); card.addWidget(self.bar)
        self.banner = Banner(""); self.banner.hide(); card.addWidget(self.banner)

        # 标题与说明
        h1 = QLabel("iBase 激活"); h1.setObjectName("H1")
        sub = QLabel("为保障使用安全与版权合规，首次使用需完成设备授权。"); sub.setObjectName("Sub"); sub.setWordWrap(True)
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
        hint = QLabel("请将上述机器码发送给管理员以获取激活码。"); hint.setObjectName("Hint"); hint.setWordWrap(True)

        form.addWidget(lab_mc,    0, 0, 1, 1)
        form.addWidget(self.ed_mc,0, 1, 1, 4)
        form.addWidget(self.btn_copy, 0, 5, 1, 1)
        form.addWidget(hint,      1, 1, 1, 5)

        # —— 激活码（右侧内嵌眼睛） —— #
        lab_cd = QLabel("激活码"); lab_cd.setObjectName("Sub")
        self.ed_code = PasswordLineEdit(); self.ed_code.setPlaceholderText("请输入激活码")
        self.ed_code.textChanged.connect(self.on_code_change)
        self.ed_code.returnPressed.connect(self.on_accept)
        self.ed_code.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Fixed)
        self.ed_code.set_hidden(True)
        Theme.frost_field(self.ed_code, blur=30, y_offset=2, alpha=64)

        # 右侧粘贴按钮（外部）
        self.btn_paste = QPushButton("粘贴"); self.btn_paste.setObjectName("Secondary")
        self.btn_paste.setMinimumWidth(96)
        self.btn_paste.setSizePolicy(QSizePolicy.Policy.Fixed, QSizePolicy.Policy.Fixed); self.btn_paste.clicked.connect(self.paste_code)
        Theme.elevate_button(self.btn_paste, blur=20, y_offset=4, alpha=68)

        form.addWidget(lab_cd,       2, 0, 1, 1)
        form.addWidget(self.ed_code, 2, 1, 1, 4)
        form.addWidget(self.btn_paste, 2, 5, 1, 1)

        # 文本对齐：与激活码输入框保持一致
        margins = self.ed_code.textMargins()
        self.ed_mc.setTextMargins(margins.left(), margins.top(), margins.right(), margins.bottom())

        form.setColumnStretch(1, 6)
        form.setColumnMinimumWidth(5, 104)

        # 操作区
        actions = QHBoxLayout(); actions.setSpacing(10); actions.addStretch(1)
        self.btn_cancel = QPushButton("取消"); self.btn_cancel.setObjectName("Secondary"); self.btn_cancel.clicked.connect(self.reject)
        Theme.elevate_button(self.btn_cancel, blur=24, y_offset=5, alpha=70)
        self.btn_ok = QPushButton("确认激活"); self.btn_ok.setObjectName("Primary"); self.btn_ok.clicked.connect(self.on_accept)
        Theme.elevate_button(self.btn_ok, blur=32, y_offset=7, alpha=90)
        self.btn_ok.setEnabled(False); actions.addWidget(self.btn_cancel); actions.addWidget(self.btn_ok)
        card.addLayout(actions)

        # 尺寸与圆角掩码
        self.setMinimumSize(520, 320); self.adjustSize()
        self.update_mask()
        self.copy_popup = CenterPopup(self)

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

    def paste_code(self):
        self.ed_code.setText(QApplication.clipboard().text(QClipboard.Mode.Clipboard))

    def on_code_change(self, s: str):
        normalized = normalize_activation_code(s)
        self.btn_ok.setEnabled(len(normalized) >= 8)
        self.banner.hide()

    def on_accept(self):
        raw_input = (self.ed_code.text() or "").strip()
        normalized = normalize_activation_code(raw_input)
        if not normalized:
            self.banner.show_msg("请输入激活码", ok=False, duration_ms=4000)
            self._shake(self)
            return
        ok, expires_at, error_msg, normalized_code = verify_activation_code(self.mc, raw_input)
        if not ok:
            if error_msg:
                self.banner.show_msg(error_msg, ok=False, duration_ms=4000)
            self._shake(self)
            return
        self.activation_code = normalized_code
        self.expires_at = expires_at
        self.banner.show_msg("激活成功 ✓", ok=True)
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
    mc = get_machine_code()

    activated = False
    expires_at: Optional[int] = None
    stored_code: Optional[str] = None

    bind = cfg.get("bind")
    if isinstance(bind, dict):
        saved_mc = _sanitize_machine_code(bind.get("machine_code", ""))
        if saved_mc == mc:
            stored_code = bind.get("activation_code", "")
            ok, exp, _err, normalized = verify_activation_code(mc, stored_code or "")
            if ok:
                activated = True
                expires_at = exp
                needs_save = False
                if not cfg.get("activated"):
                    cfg["activated"] = True
                    needs_save = True
                if (
                    normalized != (stored_code or "")
                    or bind.get("expires_at") != exp
                    or _sanitize_machine_code(bind.get("machine_code", "")) != mc
                ):
                    bind.update({
                        "activation_code": normalized,
                        "expires_at": exp,
                        "machine_code": mc,
                    })
                    cfg["bind"] = bind
                    needs_save = True
                if needs_save:
                    save_config(cfg)

    if not activated:
        dlg = ActivateDialog(mc)
        if dlg.exec() != QDialog.DialogCode.Accepted:
            return 0
        stored_code = dlg.activation_code
        expires_at = dlg.expires_at
        if not stored_code or expires_at is None:
            return 0
        cfg["activated"] = True
        cfg["bind"] = {
            "machine_code": mc,
            "activation_code": stored_code,
            "expires_at": expires_at,
        }
        save_config(cfg)

    loader = LoadingDialog()
    loader.show()
    app.processEvents()
    result = start_ibase_exe()
    QTimer.singleShot(600, loader.accept)
    loader.exec()
    return result

if __name__ == "__main__":
    sys.exit(main())
