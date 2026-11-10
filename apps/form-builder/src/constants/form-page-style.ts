export const FORM_PAGE_STYLE = `
*{box-sizing:border-box}
body{margin:0;padding:16px;font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;font-size:14px;line-height:1.5;color:#333;background:transparent}
main{max-width:560px;margin:0 auto}
h1{font-size:20px;font-weight:600;margin:0 0 4px}
h2{font-size:14px;font-weight:600;margin:24px 0 8px;padding-bottom:6px;border-bottom:1px solid #ebebeb}
p{margin:0 0 12px;color:#666}
.field{margin:0 0 12px}
.field>label,.field>span.label,legend{display:block;font-size:13px;font-weight:500;margin:0 0 4px;padding:0}
.required{color:#e5484d}
input[type=text],input[type=email],input[type=tel],input[type=url],input[type=number],input[type=date],input[type=datetime-local],select,textarea{width:100%;padding:8px 10px;font:inherit;color:inherit;background:#fff;border:1px solid #d6d6d6;border-radius:4px}
input:focus,select:focus,textarea:focus{outline:2px solid #3e63dd;outline-offset:-1px;border-color:#3e63dd}
textarea{min-height:96px;resize:vertical}
fieldset{border:0;margin:0 0 12px;padding:0}
.row{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px}
.check{display:flex;align-items:center;gap:8px;font-weight:400}
.trap{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden}
button{margin-top:8px;padding:8px 16px;font:inherit;font-weight:500;color:#fff;background:#3e63dd;border:0;border-radius:4px;cursor:pointer}
button:disabled{opacity:.6;cursor:default}
.message{margin-top:12px;padding:10px 12px;border-radius:4px}
.message.error{color:#b4232a;background:#fdecec}
.message.success{color:#18794e;background:#e9f6ee}
.message ul{margin:0;padding-left:18px}
`;
