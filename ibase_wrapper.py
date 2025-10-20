# -*- coding: utf-8 -*-
"""
iBase.exe 启动包装器 · PyQt6（无黑边·高DPI·精致UI）
- 外层外边距=0：卡片铺满窗口圆角
- 圆角用 QRegion + Path（无黑边、兼容高DPI）
- 顶部横幅提示（不再弹气泡 Toast：复制成功/激活失败仅横幅）
- 激活码右侧“眼睛”图标内嵌在输入框中，点击切换明/密
- 更优中文字体优先级与微调
- 首次激活写入配置；后续直启 iBase.exe
"""
import os
import sys
import json
import uuid
import hashlib
import platform
import subprocess
from pathlib import Path

from PyQt6.QtCore import (
    Qt, QTimer, QPoint, QRectF, QPropertyAnimation, QEasingCurve, QProcess
)
from PyQt6.QtGui import (
    QFont, QFontDatabase, QPalette, QColor, QClipboard,
    QPainter, QPainterPath, QLinearGradient, QRegion, QAction, QIcon, QPixmap
)
from PyQt6.QtWidgets import (
    QApplication, QDialog, QLabel, QLineEdit, QPushButton, QVBoxLayout, QHBoxLayout,
    QWidget, QFrame, QGridLayout, QSizePolicy, QGraphicsDropShadowEffect
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
    return hashlib.sha1(raw.encode("utf-8")).hexdigest().upper()

def calc_activation_code(mc: str) -> str:
    return hashlib.sha256((mc + SECRET_KEY).encode("utf-8")).hexdigest().upper()[:16]

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
            background: rgba(255,255,255,0.84);
            border: 1px solid rgba(120,135,170,0.22);
            border-radius: 18px;
            box-shadow: 0 14px 36px rgba(15,23,42,0.12);
        }}
        QLabel#H1{{ font-size:17pt; font-weight:800; letter-spacing:.2px; }}
        QLabel#Sub{{ color:{Theme.MUT.name()}; }}
        QLabel#Hint{{ color:{Theme.MUT.name()}; font-size:11pt; }}
        QLabel#Banner{{ padding:8px 12px; border-radius:10px; font-weight:700; }}
        QLineEdit{{
            background: rgba(255,255,255,0.70);
            border: 1px solid rgba(135,150,185,0.38);
            border-radius:14px;
            padding:8px 14px;
            min-height:36px;
            font-size:13pt;
            color: rgba(6,8,16,0.94);
            selection-background-color: rgba(120,170,255,0.40);
            selection-color: rgba(6,8,16,0.98);
        }}
        QLineEdit:hover{{
            background: rgba(255,255,255,0.76);
            border:1px solid rgba(120,170,255,0.60);
        }}
        QLineEdit:focus{{
            border:1px solid rgba(120,170,255,0.92);
            background: rgba(255,255,255,0.82);
        }}
        QLineEdit::placeholder{{ color: rgba(12,12,16,0.48); }}
        QLineEdit[readOnly="true"]{{
            color: rgba(70,120,180,0.94);
            font-family:Consolas,'Cascadia Mono','JetBrains Mono',monospace;
            letter-spacing:.6px;
            font-size:13pt;
            background: rgba(240,248,255,0.42);
        }}
        QPushButton{{
            min-height:38px;
            padding:0 24px;
            border-radius:20px;
            font-weight:700;
            letter-spacing:.28px;
            color:rgba(28,28,30,0.90);
            background: qlineargradient(x1:0,y1:0,x2:0,y2:1,
                stop:0 rgba(255,255,255,0.74),
                stop:1 rgba(255,255,255,0.28)
            );
            border:1px solid rgba(255,255,255,0.62);
        }}
        QPushButton:hover{{
            color:rgba(0,0,0,0.94);
            border:1px solid rgba(255,255,255,0.86);
            background: qlineargradient(x1:0,y1:0,x2:0,y2:1,
                stop:0 rgba(255,255,255,0.86),
                stop:1 rgba(255,255,255,0.44)
            );
        }}
        QPushButton:pressed{{
            color:rgba(0,0,0,0.80);
            border:1px solid rgba(210,220,235,0.78);
            background: qlineargradient(x1:0,y1:0,x2:0,y2:1,
                stop:0 rgba(236,238,244,0.76),
                stop:1 rgba(218,222,234,0.40)
            );
        }}
        QPushButton:disabled{{
            color:rgba(28,28,30,0.35);
            background: rgba(255,255,255,0.20);
            border:1px solid rgba(255,255,255,0.24);
        }}
        QPushButton#Primary{{
            color:rgba(255,255,255,0.97);
            border:1px solid rgba(255,255,255,0.88);
            background: qlineargradient(x1:0,y1:0,x2:1,y2:1,
                stop:0 rgba({Theme.A1.red()},{Theme.A1.green()},{Theme.A1.blue()},0.76),
                stop:1 rgba({Theme.A2.red()},{Theme.A2.green()},{Theme.A2.blue()},0.78)
            );
        }}
        QPushButton#Primary:hover{{
            background: qlineargradient(x1:0,y1:0,x2:1,y2:1,
                stop:0 rgba({Theme.A1.red()},{Theme.A1.green()},{Theme.A1.blue()},0.90),
                stop:1 rgba({Theme.A2.red()},{Theme.A2.green()},{Theme.A2.blue()},0.92)
            );
        }}
        QPushButton#Primary:pressed{{
            background: qlineargradient(x1:0,y1:0,x2:1,y2:1,
                stop:0 rgba({Theme.A1.red()},{Theme.A1.green()},{Theme.A1.blue()},0.66),
                stop:1 rgba({Theme.A2.red()},{Theme.A2.green()},{Theme.A2.blue()},0.68)
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
            color:rgba(20,22,32,0.90);
            background: rgba(255,255,255,0.36);
            border:1px solid rgba(255,255,255,0.64);
        }}
        QPushButton#Secondary:hover{{
            color:rgba(0,0,0,0.94);
            background: rgba(255,255,255,0.46);
        }}
        QPushButton#Secondary:pressed{{
            color:rgba(0,0,0,0.78);
            background: rgba(255,255,255,0.30);
        }}
        QPushButton#MacMin, QPushButton#MacClose{{
            min-height:0px;
            min-width:0px;
            padding:0px;
            margin:0px;
            border-radius:8px;
            border:1px solid rgba(255,255,255,0.45);
            background: transparent;
        }}
        QPushButton#MacMin{{ background: qradialgradient(cx:0.3,cy:0.3,radius:0.9,stop:0 #ffe29d, stop:1 #fbbc40); }}
        QPushButton#MacClose{{ background: qradialgradient(cx:0.3,cy:0.3,radius:0.9,stop:0 #ff9a9e, stop:1 #ff5f57); }}
        QPushButton#MacMin:hover{{ background: qradialgradient(cx:0.3,cy:0.3,radius:0.9,stop:0 #fff1c7, stop:1 #fdc55b); }}
        QPushButton#MacClose:hover{{ background: qradialgradient(cx:0.3,cy:0.3,radius:0.9,stop:0 #ffc0c4, stop:1 #ff746b); }}
        QPushButton#MacMin:pressed{{ background: qradialgradient(cx:0.3,cy:0.3,radius:0.9,stop:0 #ffe6a6, stop:1 #f0ab32); }}
        QPushButton#MacClose:pressed{{ background: qradialgradient(cx:0.3,cy:0.3,radius:0.9,stop:0 #ffaaa9, stop:1 #f54e49); }}
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
    def frost_field(field: QWidget, blur: int = 22, y_offset: int = 3, alpha: int = 38):
        effect = QGraphicsDropShadowEffect(field)
        effect.setBlurRadius(blur)
        effect.setOffset(0, y_offset)
        effect.setColor(QColor(15, 23, 42, alpha))
        field.setGraphicsEffect(effect)

# ======================= 小组件 =======================
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

# ======================= 激活对话框 =======================
class TitleBar(QWidget):
    def __init__(self, parent, title="iBase 激活"):
        super().__init__(parent)
        self.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Fixed)
        self.setMaximumHeight(42)
        self.drag = None
        self.lab = QLabel(title); self.lab.setObjectName("Sub")
        self.btn_min = QPushButton(""); self.btn_min.setObjectName("MacMin"); self.btn_min.setFixedSize(18, 18)
        self.btn_x   = QPushButton(""); self.btn_x.setObjectName("MacClose"); self.btn_x.setFixedSize(18, 18)
        for btn, tip in ((self.btn_min, "最小化"), (self.btn_x, "关闭")):
            btn.setToolTip(tip)
            btn.setCursor(Qt.CursorShape.PointingHandCursor)
            btn.setFocusPolicy(Qt.FocusPolicy.NoFocus)
        row = QHBoxLayout(self); row.setContentsMargins(12,10,12,0); row.setSpacing(10)
        row.addWidget(self.lab); row.addStretch(1); row.addWidget(self.btn_min); row.addWidget(self.btn_x)
        self.btn_min.clicked.connect(parent.showMinimized); self.btn_x.clicked.connect(parent.close)
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
class ActivateDialog(QDialog):
    RADIUS = 14.0  # 圆角半径（逻辑像素）

    def __init__(self, mc: str, parent: QWidget = None):
        super().__init__(parent)
        self.setWindowFlags(Qt.WindowType.FramelessWindowHint | Qt.WindowType.Dialog)
        self.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground, True)
        self.setModal(True)
        self.mc = mc

        # 外层布局（边距=0，卡片铺满圆角，不留黑圈）
        outer = QVBoxLayout(self); outer.setContentsMargins(0, 0, 0, 0)

        container = QFrame(self); container.setObjectName("Card"); container.setProperty("class", "Card")
        outer.addWidget(container)

        # 卡片内部留白
        card = QVBoxLayout(container); card.setContentsMargins(22, 18, 22, 18); card.setSpacing(12)

        # 标题栏 / 光带 / 横幅
        self.titlebar = TitleBar(self, "iBase 激活"); card.addWidget(self.titlebar)
        self.bar = AnimatedBar(); card.addWidget(self.bar)
        self.banner = Banner(""); self.banner.hide(); card.addWidget(self.banner)

        # 标题与说明
        h1 = QLabel("iBase 激活"); h1.setObjectName("H1")
        sub = QLabel("为保障使用安全与版权合规，首次使用需完成设备授权。"); sub.setObjectName("Sub"); sub.setWordWrap(True)
        card.addWidget(h1); card.addWidget(sub)

        # 表单
        form = QGridLayout(); form.setHorizontalSpacing(12); form.setVerticalSpacing(8); card.addLayout(form)

        # —— 机器码 —— #
        lab_mc = QLabel("机器码"); lab_mc.setObjectName("Sub")
        self.ed_mc = QLineEdit(); self.ed_mc.setReadOnly(True); self.ed_mc.setText(self.mc); self.ed_mc.setCursorPosition(0)
        self.ed_mc.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Fixed)
        Theme.frost_field(self.ed_mc, blur=26, y_offset=2, alpha=36)
        self.btn_copy = QPushButton("复制"); self.btn_copy.setObjectName("Secondary"); self.btn_copy.setFixedWidth(68)
        self.btn_copy.setSizePolicy(QSizePolicy.Policy.Fixed, QSizePolicy.Policy.Fixed); self.btn_copy.clicked.connect(self.copy_mc)
        Theme.elevate_button(self.btn_copy, blur=18, y_offset=4, alpha=55)
        hint = QLabel("请将上述机器码发送给管理员以获取激活码。"); hint.setObjectName("Hint"); hint.setWordWrap(True)

        form.addWidget(lab_mc,    0, 0, 1, 1)
        form.addWidget(self.ed_mc,0, 1, 1, 4)
        form.addWidget(self.btn_copy, 0, 5, 1, 1)
        form.addWidget(hint,      1, 1, 1, 5)

        # —— 激活码（右侧内嵌眼睛） —— #
        lab_cd = QLabel("激活码"); lab_cd.setObjectName("Sub")
        self.ed_code = QLineEdit(); self.ed_code.setPlaceholderText("请输入激活码")
        self.ed_code.setEchoMode(QLineEdit.EchoMode.Normal)
        self.ed_code.textChanged.connect(self.on_code_change)
        self.ed_code.returnPressed.connect(self.on_accept)
        self.ed_code.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Fixed)
        Theme.frost_field(self.ed_code, blur=26, y_offset=2, alpha=40)

        # 右侧粘贴按钮（外部）
        self.btn_paste = QPushButton("粘贴"); self.btn_paste.setObjectName("Secondary"); self.btn_paste.setFixedWidth(68)
        self.btn_paste.setSizePolicy(QSizePolicy.Policy.Fixed, QSizePolicy.Policy.Fixed); self.btn_paste.clicked.connect(self.paste_code)
        Theme.elevate_button(self.btn_paste, blur=18, y_offset=4, alpha=55)

        # 内嵌“眼睛”动作（TrailingPosition）
        self.eye_action = QAction(self)
        self.eye_action.setCheckable(True)
        self.eye_action.toggled.connect(self.toggle_echo)
        # 初始化图标
        self._eye_open_icon = self._make_eye_icon(open_eye=True)
        self._eye_closed_icon = self._make_eye_icon(open_eye=False)
        self._update_eye_icon(False)
        self.ed_code.addAction(self.eye_action, QLineEdit.ActionPosition.TrailingPosition)

        form.addWidget(lab_cd,       2, 0, 1, 1)
        form.addWidget(self.ed_code, 2, 1, 1, 4)
        form.addWidget(self.btn_paste, 2, 5, 1, 1)

        form.setColumnStretch(1, 5)
        form.setColumnMinimumWidth(5, 76)

        # 操作区
        actions = QHBoxLayout(); actions.setSpacing(8); actions.addStretch(1)
        self.btn_cancel = QPushButton("取消"); self.btn_cancel.setObjectName("Secondary"); self.btn_cancel.clicked.connect(self.reject)
        Theme.elevate_button(self.btn_cancel, blur=22, y_offset=5, alpha=60)
        self.btn_ok = QPushButton("确认登录"); self.btn_ok.setObjectName("Primary"); self.btn_ok.clicked.connect(self.on_accept)
        Theme.elevate_button(self.btn_ok, blur=26, y_offset=6, alpha=72)
        self.btn_ok.setEnabled(False); actions.addWidget(self.btn_cancel); actions.addWidget(self.btn_ok)
        card.addLayout(actions)

        # 尺寸与圆角掩码
        self.setMinimumSize(520, 320); self.adjustSize()
        self.update_mask()

        # 入场轻浮动
        container.move(container.x(), container.y() + 8)
        ani = QPropertyAnimation(container, b"pos", self)
        ani.setDuration(220); ani.setStartValue(container.pos())
        ani.setEndValue(QPoint(container.x(), container.y() - 8))
        ani.setEasingCurve(QEasingCurve.Type.OutCubic)
        ani.start(QPropertyAnimation.DeletionPolicy.DeleteWhenStopped)

    # --- 眼睛图标绘制与更新 ---
    def _make_eye_icon(self, open_eye: bool, size: int = 18) -> QIcon:
        pm = QPixmap(size, size); pm.fill(Qt.GlobalColor.transparent)
        p = QPainter(pm)
        p.setRenderHint(QPainter.RenderHint.Antialiasing)
        # 眼眶
        p.setPen(QColor(210, 220, 235))
        p.setBrush(Qt.BrushStyle.NoBrush)
        rect = QRectF(1.5, size*0.32, size-3.0, size*0.36)
        path = QPainterPath()
        path.addEllipse(rect)
        p.drawPath(path)
        # 瞳孔 / 闭眼线
        if open_eye:
            p.setBrush(QColor(210, 220, 235))
            p.setPen(Qt.PenStyle.NoPen)
            r = QRectF(size*0.45, size*0.45, size*0.10, size*0.10)
            p.drawEllipse(r)
        else:
            p.setPen(QColor(210, 220, 235))
            p.drawLine(int(size*0.22), int(size*0.70), int(size*0.78), int(size*0.30))
        p.end()
        return QIcon(pm)

    def _update_eye_icon(self, hidden: bool):
        # hidden=True 表示密码模式
        self.eye_action.setIcon(self._eye_closed_icon if hidden else self._eye_open_icon)
        self.eye_action.setToolTip("显示" if hidden else "隐藏")

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
        QApplication.clipboard().setText(self.ed_mc.text(), QClipboard.Mode.Clipboard)
        # 仅横幅，不再弹 Toast
        self.banner.show_msg("机器码已复制", ok=True)

    def paste_code(self):
        self.ed_code.setText(QApplication.clipboard().text(QClipboard.Mode.Clipboard))

    def toggle_echo(self, hide: bool):
        self.ed_code.setEchoMode(QLineEdit.EchoMode.Password if hide else QLineEdit.EchoMode.Normal)
        self._update_eye_icon(hide)

    def on_code_change(self, s: str):
        self.btn_ok.setEnabled(len((s or "").strip()) >= 4)
        self.banner.hide()

    def on_accept(self):
        code = (self.ed_code.text() or "").strip().upper()
        if not code:
            self.banner.show_msg("请输入激活码", ok=False)
            self._shake(self)
            return
        expect = calc_activation_code(self.mc)
        if code != expect:
            # 仅横幅，不再弹 Toast
            self.banner.show_msg("激活码不正确，请核对后再试。", ok=False)
            self._shake(self)
            return
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
    if cfg.get("activated") and isinstance(cfg.get("bind"), dict):
        b = cfg["bind"]
        if b.get("machine_code") == mc and b.get("activation_code") == calc_activation_code(mc):
            activated = True

    if not activated:
        dlg = ActivateDialog(mc)
        if dlg.exec() != QDialog.DialogCode.Accepted:
            return 0
        cfg["activated"] = True
        cfg["bind"] = {"machine_code": mc, "activation_code": calc_activation_code(mc)}
        save_config(cfg)

    return start_ibase_exe()

if __name__ == "__main__":
    sys.exit(main())
