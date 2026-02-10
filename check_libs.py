
import sys
try:
    import pydub
    print("pydub: installed")
except ImportError:
    print("pydub: not installed")

try:
    import soundfile
    print("soundfile: installed")
except ImportError:
    print("soundfile: not installed")
