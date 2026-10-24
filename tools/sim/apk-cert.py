# Print the signing certificate of an APK (subject, expiry, SHA-256), to check a release is signed with the
# Orbitarium key and not a throwaway debug key ("CN=Android Debug"). Needs: pip install androguard
#   python3 -I tools/sim/apk-cert.py orbitarium-26.apk
import sys, hashlib, logging
logging.disable(logging.CRITICAL)
from loguru import logger; logger.remove()
from androguard.core.apk import APK
a = APK(sys.argv[1])
print('v1', a.is_signed_v1(), 'v2', a.is_signed_v2(), 'v3', a.is_signed_v3())
ders = a.get_certificates_der_v3() or a.get_certificates_der_v2() or [c.dump() for c in a.get_certificates_v1()]
from asn1crypto import x509
for d in ders:
    c = x509.Certificate.load(d)
    print('subject:', c.subject.human_friendly)
    print('valid until:', c['tbs_certificate']['validity']['not_after'].native)
    print('SHA-256:', ':'.join(f'{b:02X}' for b in hashlib.sha256(d).digest()))
