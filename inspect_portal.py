import urllib.request, ssl, re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

req = urllib.request.Request('https://dev.zemenbank.et:3000/login', headers={'User-Agent': 'Mozilla/5.0'})
try:
    html = urllib.request.urlopen(req, context=ctx).read().decode('utf-8')
    chunks = re.findall(r'/_next/static/chunks/[a-zA-Z0-9_\-\.]+\.js', html)
    print("Chunks:", chunks)
    for c in chunks:
        js_url = f'https://dev.zemenbank.et:3000{c}'
        try:
            js_code = urllib.request.urlopen(urllib.request.Request(js_url, headers={'User-Agent': 'Mozilla/5.0'}), context=ctx).read().decode('utf-8')
            if 'admin/payments' in js_code or 'Payments' in js_code or 'sidebar' in js_code.lower() or 'nav' in js_code.lower():
                print(f"Matched chunk {c} ({len(js_code)} bytes)")
                # Find some text or classes
                matches = re.findall(r'(sidebar[a-zA-Z0-9_\-]*|admin[a-zA-Z0-9_\-]*)', js_code)
                print("  Tokens:", set(matches[:20]))
        except Exception as e:
            pass
except Exception as e:
    print("Error:", e)
