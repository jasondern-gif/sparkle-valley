const {chromium}=require('playwright-core');
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');

async function browserLaunch(){
  const isFile=p=>{try{return fs.statSync(p).isFile();}catch(e){if(e.code==='ENOENT'||e.code==='ENOTDIR')return false;throw e;}};
  if(process.env.CHROMIUM_PATH){
    if(!isFile(process.env.CHROMIUM_PATH))throw new Error('CHROMIUM_PATH does not point to a browser executable');
    return chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true});
  }
  try{return await chromium.launch({headless:true});}
  catch(e){if(!e.message.includes("Executable doesn't exist"))throw e;}
  const names=process.platform==='win32'?['msedge.exe','chrome.exe','chromium.exe']:
    ['chromium','chromium-browser','google-chrome','google-chrome-stable','microsoft-edge','microsoft-edge-stable'];
  const candidates=[];
  if(process.platform==='win32'){
    for(const dir of [process.env['PROGRAMFILES(X86)'],process.env.PROGRAMFILES,process.env.LOCALAPPDATA].filter(Boolean))
      candidates.push(path.join(dir,'Microsoft','Edge','Application','msedge.exe'),path.join(dir,'Google','Chrome','Application','chrome.exe'));
  }else if(process.platform==='darwin'){
    candidates.push('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome','/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge');
  }
  for(const dir of (process.env.PATH||'').split(path.delimiter).filter(Boolean))for(const name of names)candidates.push(path.join(dir,name));
  const found=candidates.find(isFile);
  if(!found)throw new Error('No Chromium or Edge browser found. Install Playwright Chromium or set CHROMIUM_PATH.');
  return chromium.launch({executablePath:found,headless:true});
}
function serve(){
  const root=path.resolve(__dirname,'..','..');
  const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.png':'image/png','.mp3':'audio/mpeg'};
  const server=http.createServer((req,res)=>{
    let pathname;
    try{pathname=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);}catch(e){res.writeHead(400);res.end('Bad URL');return;}
    const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
    if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403);res.end('Forbidden');return;}
    fs.readFile(file,(err,data)=>{
      if(err){res.writeHead(err.code==='ENOENT'?404:500);res.end();return;}
      res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});res.end(data);
    });
  });
  return new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',()=>resolve(server));});
}
module.exports={browserLaunch,serve};
