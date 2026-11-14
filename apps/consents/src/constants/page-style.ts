// Styles of the public pages, in line with the form builder's forms.
export const PAGE_STYLE = `
*{box-sizing:border-box}
body{margin:0;padding:24px 16px;font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;font-size:14px;line-height:1.5;color:#333;background:#fff}
main{max-width:560px;margin:0 auto}
h1{font-size:20px;font-weight:600;margin:0 0 8px}
h2{font-size:15px;font-weight:600;margin:24px 0 4px;padding-bottom:6px;border-bottom:1px solid #ebebeb}
h3{font-size:14px;font-weight:500;margin:16px 0 4px}
p{margin:0 0 12px;color:#666}
ul{margin:0 0 12px;padding-left:20px}
a{color:#3e63dd}
.option{display:flex;gap:10px;align-items:flex-start;padding:10px 0;border-bottom:1px solid #f1f1f1}
.option input{margin-top:3px;width:16px;height:16px;flex:none}
.option label{font-weight:500}
.option .help{display:block;font-weight:400;color:#666;font-size:13px}
.nested{margin-left:26px}
.disabled{opacity:.55}
.notice{padding:10px 12px;margin:0 0 16px;border-radius:4px;background:#e9f9ee;color:#1e6b38}
button{margin-top:16px;padding:9px 18px;font:inherit;font-weight:500;color:#fff;background:#3e63dd;border:0;border-radius:4px;cursor:pointer}
button:focus-visible,input:focus-visible{outline:2px solid #3e63dd;outline-offset:2px}
@media (prefers-color-scheme:dark){body{background:#171717;color:#ebebeb}p,.option .help{color:#b3b3b3}h2,.option{border-color:#333}.notice{background:#1d3a26;color:#a8e6b9}a{color:#8da4ef}}
`;
