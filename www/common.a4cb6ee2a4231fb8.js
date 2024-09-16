"use strict";(self.webpackChunkapp=self.webpackChunkapp||[]).push([[2076],{4556:(b,y,c)=>{c.d(y,{c:()=>t});var _=c(4261),f=c(1086),u=c(8607);const t=(i,a)=>{let n,e;const v=(d,w,M)=>{if(typeof document>"u")return;const O=document.elementFromPoint(d,w);O&&a(O)&&!O.disabled?O!==n&&(l(),g(O,M)):l()},g=(d,w)=>{n=d,e||(e=n);const M=n;(0,_.w)(()=>M.classList.add("ion-activated")),w()},l=(d=!1)=>{if(!n)return;const w=n;(0,_.w)(()=>w.classList.remove("ion-activated")),d&&e!==n&&n.click(),n=void 0};return(0,u.createGesture)({el:i,gestureName:"buttonActiveDrag",threshold:0,onStart:d=>v(d.currentX,d.currentY,f.a),onMove:d=>v(d.currentX,d.currentY,f.b),onEnd:()=>{l(!0),(0,f.h)(),e=void 0}})}},8438:(b,y,c)=>{c.d(y,{g:()=>f});var _=c(8476);const f=()=>{if(void 0!==_.w)return _.w.Capacitor}},5572:(b,y,c)=>{c.d(y,{c:()=>_,i:()=>f});const _=(u,t,i)=>"function"==typeof i?i(u,t):"string"==typeof i?u[i]===t[i]:Array.isArray(t)?t.includes(u):u===t,f=(u,t,i)=>void 0!==u&&(Array.isArray(u)?u.some(a=>_(a,t,i)):_(u,t,i))},3351:(b,y,c)=>{c.d(y,{g:()=>_});const _=(a,n,e,v,g)=>u(a[1],n[1],e[1],v[1],g).map(l=>f(a[0],n[0],e[0],v[0],l)),f=(a,n,e,v,g)=>g*(3*n*Math.pow(g-1,2)+g*(-3*e*g+3*e+v*g))-a*Math.pow(g-1,3),u=(a,n,e,v,g)=>i((v-=g)-3*(e-=g)+3*(n-=g)-(a-=g),3*e-6*n+3*a,3*n-3*a,a).filter(d=>d>=0&&d<=1),i=(a,n,e,v)=>{if(0===a)return((a,n,e)=>{const v=n*n-4*a*e;return v<0?[]:[(-n+Math.sqrt(v))/(2*a),(-n-Math.sqrt(v))/(2*a)]})(n,e,v);const g=(3*(e/=a)-(n/=a)*n)/3,l=(2*n*n*n-9*n*e+27*(v/=a))/27;if(0===g)return[Math.pow(-l,1/3)];if(0===l)return[Math.sqrt(-g),-Math.sqrt(-g)];const d=Math.pow(l/2,2)+Math.pow(g/3,3);if(0===d)return[Math.pow(l/2,.5)-n/3];if(d>0)return[Math.pow(-l/2+Math.sqrt(d),1/3)-Math.pow(l/2+Math.sqrt(d),1/3)-n/3];const w=Math.sqrt(Math.pow(-g/3,3)),M=Math.acos(-l/(2*Math.sqrt(Math.pow(-g/3,3)))),O=2*Math.pow(w,1/3);return[O*Math.cos(M/3)-n/3,O*Math.cos((M+2*Math.PI)/3)-n/3,O*Math.cos((M+4*Math.PI)/3)-n/3]}},5083:(b,y,c)=>{c.d(y,{i:()=>_});const _=f=>f&&""!==f.dir?"rtl"===f.dir.toLowerCase():"rtl"===(null==document?void 0:document.dir.toLowerCase())},3126:(b,y,c)=>{c.r(y),c.d(y,{startFocusVisible:()=>t});const _="ion-focused",u=["Tab","ArrowDown","Space","Escape"," ","Shift","Enter","ArrowLeft","ArrowRight","ArrowUp","Home","End"],t=i=>{let a=[],n=!0;const e=i?i.shadowRoot:document,v=i||document.body,g=C=>{a.forEach(m=>m.classList.remove(_)),C.forEach(m=>m.classList.add(_)),a=C},l=()=>{n=!1,g([])},d=C=>{n=u.includes(C.key),n||g([])},w=C=>{if(n&&void 0!==C.composedPath){const m=C.composedPath().filter(E=>!!E.classList&&E.classList.contains("ion-focusable"));g(m)}},M=()=>{e.activeElement===v&&g([])};return e.addEventListener("keydown",d),e.addEventListener("focusin",w),e.addEventListener("focusout",M),e.addEventListener("touchstart",l,{passive:!0}),e.addEventListener("mousedown",l),{destroy:()=>{e.removeEventListener("keydown",d),e.removeEventListener("focusin",w),e.removeEventListener("focusout",M),e.removeEventListener("touchstart",l),e.removeEventListener("mousedown",l)},setFocus:g}}},1086:(b,y,c)=>{c.d(y,{I:()=>f,a:()=>n,b:()=>e,c:()=>a,d:()=>g,h:()=>v});var _=c(8438),f=function(l){return l.Heavy="HEAVY",l.Medium="MEDIUM",l.Light="LIGHT",l}(f||{});const t={getEngine(){const l=(0,_.g)();if(null!=l&&l.isPluginAvailable("Haptics"))return l.Plugins.Haptics},available(){if(!this.getEngine())return!1;const d=(0,_.g)();return"web"!==(null==d?void 0:d.getPlatform())||typeof navigator<"u"&&void 0!==navigator.vibrate},impact(l){const d=this.getEngine();d&&d.impact({style:l.style})},notification(l){const d=this.getEngine();d&&d.notification({type:l.type})},selection(){this.impact({style:f.Light})},selectionStart(){const l=this.getEngine();l&&l.selectionStart()},selectionChanged(){const l=this.getEngine();l&&l.selectionChanged()},selectionEnd(){const l=this.getEngine();l&&l.selectionEnd()}},i=()=>t.available(),a=()=>{i()&&t.selection()},n=()=>{i()&&t.selectionStart()},e=()=>{i()&&t.selectionChanged()},v=()=>{i()&&t.selectionEnd()},g=l=>{i()&&t.impact(l)}},909:(b,y,c)=>{c.d(y,{I:()=>a,a:()=>g,b:()=>i,c:()=>w,d:()=>O,f:()=>l,g:()=>v,i:()=>e,p:()=>M,r:()=>C,s:()=>d});var _=c(467),f=c(4920),u=c(4929);const i="ion-content",a=".ion-content-scroll-host",n=`${i}, ${a}`,e=m=>"ION-CONTENT"===m.tagName,v=function(){var m=(0,_.A)(function*(E){return e(E)?(yield new Promise(p=>(0,f.c)(E,p)),E.getScrollElement()):E});return function(p){return m.apply(this,arguments)}}(),g=m=>m.querySelector(a)||m.querySelector(n),l=m=>m.closest(n),d=(m,E)=>e(m)?m.scrollToTop(E):Promise.resolve(m.scrollTo({top:0,left:0,behavior:E>0?"smooth":"auto"})),w=(m,E,p,s)=>e(m)?m.scrollByPoint(E,p,s):Promise.resolve(m.scrollBy({top:p,left:E,behavior:s>0?"smooth":"auto"})),M=m=>(0,u.b)(m,i),O=m=>{if(e(m)){const p=m.scrollY;return m.scrollY=!1,p}return m.style.setProperty("overflow","hidden"),!0},C=(m,E)=>{e(m)?m.scrollY=E:m.style.removeProperty("overflow")}},3992:(b,y,c)=>{c.d(y,{a:()=>_,b:()=>w,c:()=>n,d:()=>M,e:()=>A,f:()=>a,g:()=>O,h:()=>u,i:()=>f,j:()=>r,k:()=>h,l:()=>e,m:()=>l,n:()=>C,o:()=>g,p:()=>i,q:()=>t,r:()=>o,s:()=>D,t:()=>d,u:()=>p,v:()=>s,w:()=>v,x:()=>m,y:()=>E});const _="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' class='ionicon' viewBox='0 0 512 512'><path stroke-linecap='square' stroke-miterlimit='10' stroke-width='48' d='M244 400L100 256l144-144M120 256h292' class='ionicon-fill-none'/></svg>",f="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' class='ionicon' viewBox='0 0 512 512'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='48' d='M112 268l144 144 144-144M256 392V100' class='ionicon-fill-none'/></svg>",u="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' class='ionicon' viewBox='0 0 512 512'><path d='M368 64L144 256l224 192V64z'/></svg>",t="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' class='ionicon' viewBox='0 0 512 512'><path d='M64 144l192 224 192-224H64z'/></svg>",i="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' class='ionicon' viewBox='0 0 512 512'><path d='M448 368L256 144 64 368h384z'/></svg>",a="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' class='ionicon' viewBox='0 0 512 512'><path stroke-linecap='round' stroke-linejoin='round' d='M416 128L192 384l-96-96' class='ionicon-fill-none ionicon-stroke-width'/></svg>",n="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' class='ionicon' viewBox='0 0 512 512'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='48' d='M328 112L184 256l144 144' class='ionicon-fill-none'/></svg>",e="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' class='ionicon' viewBox='0 0 512 512'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='48' d='M112 184l144 144 144-144' class='ionicon-fill-none'/></svg>",v="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' class='ionicon' viewBox='0 0 512 512'><path d='M136 208l120-104 120 104M136 304l120 104 120-104' stroke-width='48' stroke-linecap='round' stroke-linejoin='round' class='ionicon-fill-none'/></svg>",g="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' class='ionicon' viewBox='0 0 512 512'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='48' d='M184 112l144 144-144 144' class='ionicon-fill-none'/></svg>",l="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' class='ionicon' viewBox='0 0 512 512'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='48' d='M184 112l144 144-144 144' class='ionicon-fill-none'/></svg>",d="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' class='ionicon' viewBox='0 0 512 512'><path d='M289.94 256l95-95A24 24 0 00351 127l-95 95-95-95a24 24 0 00-34 34l95 95-95 95a24 24 0 1034 34l95-95 95 95a24 24 0 0034-34z'/></svg>",w="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' class='ionicon' viewBox='0 0 512 512'><path d='M256 48C141.31 48 48 141.31 48 256s93.31 208 208 208 208-93.31 208-208S370.69 48 256 48zm75.31 260.69a16 16 0 11-22.62 22.62L256 278.63l-52.69 52.68a16 16 0 01-22.62-22.62L233.37 256l-52.68-52.69a16 16 0 0122.62-22.62L256 233.37l52.69-52.68a16 16 0 0122.62 22.62L278.63 256z'/></svg>",M="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' class='ionicon' viewBox='0 0 512 512'><path d='M400 145.49L366.51 112 256 222.51 145.49 112 112 145.49 222.51 256 112 366.51 145.49 400 256 289.49 366.51 400 400 366.51 289.49 256 400 145.49z'/></svg>",O="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' class='ionicon' viewBox='0 0 512 512'><circle cx='256' cy='256' r='192' stroke-linecap='round' stroke-linejoin='round' class='ionicon-fill-none ionicon-stroke-width'/></svg>",C="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' class='ionicon' viewBox='0 0 512 512'><circle cx='256' cy='256' r='48'/><circle cx='416' cy='256' r='48'/><circle cx='96' cy='256' r='48'/></svg>",m="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' class='ionicon' viewBox='0 0 512 512'><circle cx='256' cy='256' r='64'/><path d='M490.84 238.6c-26.46-40.92-60.79-75.68-99.27-100.53C349 110.55 302 96 255.66 96c-42.52 0-84.33 12.15-124.27 36.11-40.73 24.43-77.63 60.12-109.68 106.07a31.92 31.92 0 00-.64 35.54c26.41 41.33 60.4 76.14 98.28 100.65C162 402 207.9 416 255.66 416c46.71 0 93.81-14.43 136.2-41.72 38.46-24.77 72.72-59.66 99.08-100.92a32.2 32.2 0 00-.1-34.76zM256 352a96 96 0 1196-96 96.11 96.11 0 01-96 96z'/></svg>",E="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' class='ionicon' viewBox='0 0 512 512'><path d='M432 448a15.92 15.92 0 01-11.31-4.69l-352-352a16 16 0 0122.62-22.62l352 352A16 16 0 01432 448zM248 315.85l-51.79-51.79a2 2 0 00-3.39 1.69 64.11 64.11 0 0053.49 53.49 2 2 0 001.69-3.39zM264 196.15L315.87 248a2 2 0 003.4-1.69 64.13 64.13 0 00-53.55-53.55 2 2 0 00-1.72 3.39z'/><path d='M491 273.36a32.2 32.2 0 00-.1-34.76c-26.46-40.92-60.79-75.68-99.27-100.53C349 110.55 302 96 255.68 96a226.54 226.54 0 00-71.82 11.79 4 4 0 00-1.56 6.63l47.24 47.24a4 4 0 003.82 1.05 96 96 0 01116 116 4 4 0 001.05 3.81l67.95 68a4 4 0 005.4.24 343.81 343.81 0 0067.24-77.4zM256 352a96 96 0 01-93.3-118.63 4 4 0 00-1.05-3.81l-66.84-66.87a4 4 0 00-5.41-.23c-24.39 20.81-47 46.13-67.67 75.72a31.92 31.92 0 00-.64 35.54c26.41 41.33 60.39 76.14 98.28 100.65C162.06 402 207.92 416 255.68 416a238.22 238.22 0 0072.64-11.55 4 4 0 001.61-6.64l-47.47-47.46a4 4 0 00-3.81-1.05A96 96 0 01256 352z'/></svg>",p="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' class='ionicon' viewBox='0 0 512 512'><path stroke-linecap='round' stroke-miterlimit='10' d='M80 160h352M80 256h352M80 352h352' class='ionicon-fill-none ionicon-stroke-width'/></svg>",s="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' class='ionicon' viewBox='0 0 512 512'><path d='M64 384h384v-42.67H64zm0-106.67h384v-42.66H64zM64 128v42.67h384V128z'/></svg>",o="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' class='ionicon' viewBox='0 0 512 512'><path stroke-linecap='round' stroke-linejoin='round' d='M400 256H112' class='ionicon-fill-none ionicon-stroke-width'/></svg>",r="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' class='ionicon' viewBox='0 0 512 512'><path stroke-linecap='round' stroke-linejoin='round' d='M96 256h320M96 176h320M96 336h320' class='ionicon-fill-none ionicon-stroke-width'/></svg>",h="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' class='ionicon' viewBox='0 0 512 512'><path stroke-linecap='square' stroke-linejoin='round' stroke-width='44' d='M118 304h276M118 208h276' class='ionicon-fill-none'/></svg>",D="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' class='ionicon' viewBox='0 0 512 512'><path d='M221.09 64a157.09 157.09 0 10157.09 157.09A157.1 157.1 0 00221.09 64z' stroke-miterlimit='10' class='ionicon-fill-none ionicon-stroke-width'/><path stroke-linecap='round' stroke-miterlimit='10' d='M338.29 338.29L448 448' class='ionicon-fill-none ionicon-stroke-width'/></svg>",A="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' class='ionicon' viewBox='0 0 512 512'><path d='M464 428L339.92 303.9a160.48 160.48 0 0030.72-94.58C370.64 120.37 298.27 48 209.32 48S48 120.37 48 209.32s72.37 161.32 161.32 161.32a160.48 160.48 0 0094.58-30.72L428 464zM209.32 319.69a110.38 110.38 0 11110.37-110.37 110.5 110.5 0 01-110.37 110.37z'/></svg>"},243:(b,y,c)=>{c.d(y,{c:()=>t,g:()=>i});var _=c(8476),f=c(4920),u=c(4929);const t=(n,e,v)=>{let g,l;if(void 0!==_.w&&"MutationObserver"in _.w){const O=Array.isArray(e)?e:[e];g=new MutationObserver(C=>{for(const m of C)for(const E of m.addedNodes)if(E.nodeType===Node.ELEMENT_NODE&&O.includes(E.slot))return v(),void(0,f.r)(()=>d(E))}),g.observe(n,{childList:!0,subtree:!0})}const d=O=>{var C;l&&(l.disconnect(),l=void 0),l=new MutationObserver(m=>{v();for(const E of m)for(const p of E.removedNodes)p.nodeType===Node.ELEMENT_NODE&&p.slot===e&&M()}),l.observe(null!==(C=O.parentElement)&&void 0!==C?C:O,{subtree:!0,childList:!0})},M=()=>{l&&(l.disconnect(),l=void 0)};return{destroy:()=>{g&&(g.disconnect(),g=void 0),M()}}},i=(n,e,v)=>{const g=null==n?0:n.toString().length,l=a(g,e);if(void 0===v)return l;try{return v(g,e)}catch(d){return(0,u.a)("Exception in provided `counterFormatter`.",d),l}},a=(n,e)=>`${n} / ${e}`},1622:(b,y,c)=>{c.r(y),c.d(y,{KEYBOARD_DID_CLOSE:()=>i,KEYBOARD_DID_OPEN:()=>t,copyVisualViewport:()=>o,keyboardDidClose:()=>m,keyboardDidOpen:()=>O,keyboardDidResize:()=>C,resetKeyboardAssist:()=>g,setKeyboardClose:()=>M,setKeyboardOpen:()=>w,startKeyboardAssist:()=>l,trackViewportChanges:()=>s});var _=c(4379);c(8438),c(8476);const t="ionKeyboardDidShow",i="ionKeyboardDidHide";let n={},e={},v=!1;const g=()=>{n={},e={},v=!1},l=r=>{if(_.K.getEngine())d(r);else{if(!r.visualViewport)return;e=o(r.visualViewport),r.visualViewport.onresize=()=>{s(r),O()||C(r)?w(r):m(r)&&M(r)}}},d=r=>{r.addEventListener("keyboardDidShow",h=>w(r,h)),r.addEventListener("keyboardDidHide",()=>M(r))},w=(r,h)=>{E(r,h),v=!0},M=r=>{p(r),v=!1},O=()=>!v&&n.width===e.width&&(n.height-e.height)*e.scale>150,C=r=>v&&!m(r),m=r=>v&&e.height===r.innerHeight,E=(r,h)=>{const A=new CustomEvent(t,{detail:{keyboardHeight:h?h.keyboardHeight:r.innerHeight-e.height}});r.dispatchEvent(A)},p=r=>{const h=new CustomEvent(i);r.dispatchEvent(h)},s=r=>{n=Object.assign({},e),e=o(r.visualViewport)},o=r=>({width:Math.round(r.width),height:Math.round(r.height),offsetTop:r.offsetTop,offsetLeft:r.offsetLeft,pageTop:r.pageTop,pageLeft:r.pageLeft,scale:r.scale})},4379:(b,y,c)=>{c.d(y,{K:()=>t,a:()=>u});var _=c(8438),f=function(i){return i.Unimplemented="UNIMPLEMENTED",i.Unavailable="UNAVAILABLE",i}(f||{}),u=function(i){return i.Body="body",i.Ionic="ionic",i.Native="native",i.None="none",i}(u||{});const t={getEngine(){const i=(0,_.g)();if(null!=i&&i.isPluginAvailable("Keyboard"))return i.Plugins.Keyboard},getResizeMode(){const i=this.getEngine();return null!=i&&i.getResizeMode?i.getResizeMode().catch(a=>{if(a.code!==f.Unimplemented)throw a}):Promise.resolve(void 0)}}},4731:(b,y,c)=>{c.d(y,{c:()=>a});var _=c(467),f=c(8476),u=c(4379);const t=n=>{if(void 0===f.d||n===u.a.None||void 0===n)return null;const e=f.d.querySelector("ion-app");return null!=e?e:f.d.body},i=n=>{const e=t(n);return null===e?0:e.clientHeight},a=function(){var n=(0,_.A)(function*(e){let v,g,l,d;const w=function(){var E=(0,_.A)(function*(){const p=yield u.K.getResizeMode(),s=void 0===p?void 0:p.mode;v=()=>{void 0===d&&(d=i(s)),l=!0,M(l,s)},g=()=>{l=!1,M(l,s)},null==f.w||f.w.addEventListener("keyboardWillShow",v),null==f.w||f.w.addEventListener("keyboardWillHide",g)});return function(){return E.apply(this,arguments)}}(),M=(E,p)=>{e&&e(E,O(p))},O=E=>{if(0===d||d===i(E))return;const p=t(E);return null!==p?new Promise(s=>{const r=new ResizeObserver(()=>{p.clientHeight===d&&(r.disconnect(),s())});r.observe(p)}):void 0};return yield w(),{init:w,destroy:()=>{null==f.w||f.w.removeEventListener("keyboardWillShow",v),null==f.w||f.w.removeEventListener("keyboardWillHide",g),v=g=void 0},isKeyboardVisible:()=>l}});return function(v){return n.apply(this,arguments)}}()},7838:(b,y,c)=>{c.d(y,{c:()=>f});var _=c(467);const f=()=>{let u;return{lock:function(){var i=(0,_.A)(function*(){const a=u;let n;return u=new Promise(e=>n=e),void 0!==a&&(yield a),n});return function(){return i.apply(this,arguments)}}()}}},9001:(b,y,c)=>{c.d(y,{c:()=>u});var _=c(8476),f=c(4920);const u=(t,i,a)=>{let n;const e=()=>!(void 0===i()||void 0!==t.label||null===a()),g=()=>{const d=i();if(void 0===d)return;if(!e())return void d.style.removeProperty("width");const w=a().scrollWidth;if(0===w&&null===d.offsetParent&&void 0!==_.w&&"IntersectionObserver"in _.w){if(void 0!==n)return;const M=n=new IntersectionObserver(O=>{1===O[0].intersectionRatio&&(g(),M.disconnect(),n=void 0)},{threshold:.01,root:t});M.observe(d)}else d.style.setProperty("width",.75*w+"px")};return{calculateNotchWidth:()=>{e()&&(0,f.r)(()=>{g()})},destroy:()=>{n&&(n.disconnect(),n=void 0)}}}},7895:(b,y,c)=>{c.d(y,{S:()=>f});const f={bubbles:{dur:1e3,circles:9,fn:(u,t,i)=>{const a=u*t/i-u+"ms",n=2*Math.PI*t/i;return{r:5,style:{top:32*Math.sin(n)+"%",left:32*Math.cos(n)+"%","animation-delay":a}}}},circles:{dur:1e3,circles:8,fn:(u,t,i)=>{const a=t/i,n=u*a-u+"ms",e=2*Math.PI*a;return{r:5,style:{top:32*Math.sin(e)+"%",left:32*Math.cos(e)+"%","animation-delay":n}}}},circular:{dur:1400,elmDuration:!0,circles:1,fn:()=>({r:20,cx:48,cy:48,fill:"none",viewBox:"24 24 48 48",transform:"translate(0,0)",style:{}})},crescent:{dur:750,circles:1,fn:()=>({r:26,style:{}})},dots:{dur:750,circles:3,fn:(u,t)=>({r:6,style:{left:32-32*t+"%","animation-delay":-110*t+"ms"}})},lines:{dur:1e3,lines:8,fn:(u,t,i)=>({y1:14,y2:26,style:{transform:`rotate(${360/i*t+(t<i/2?180:-180)}deg)`,"animation-delay":u*t/i-u+"ms"}})},"lines-small":{dur:1e3,lines:8,fn:(u,t,i)=>({y1:12,y2:20,style:{transform:`rotate(${360/i*t+(t<i/2?180:-180)}deg)`,"animation-delay":u*t/i-u+"ms"}})},"lines-sharp":{dur:1e3,lines:12,fn:(u,t,i)=>({y1:17,y2:29,style:{transform:`rotate(${30*t+(t<6?180:-180)}deg)`,"animation-delay":u*t/i-u+"ms"}})},"lines-sharp-small":{dur:1e3,lines:12,fn:(u,t,i)=>({y1:12,y2:20,style:{transform:`rotate(${30*t+(t<6?180:-180)}deg)`,"animation-delay":u*t/i-u+"ms"}})}}},7166:(b,y,c)=>{c.r(y),c.d(y,{createSwipeBackGesture:()=>i});var _=c(4920),f=c(5083),u=c(8607);c(1970);const i=(a,n,e,v,g)=>{const l=a.ownerDocument.defaultView;let d=(0,f.i)(a);const M=p=>d?-p.deltaX:p.deltaX;return(0,u.createGesture)({el:a,gestureName:"goback-swipe",gesturePriority:101,threshold:10,canStart:p=>(d=(0,f.i)(a),(p=>{const{startX:o}=p;return d?o>=l.innerWidth-50:o<=50})(p)&&n()),onStart:e,onMove:p=>{const o=M(p)/l.innerWidth;v(o)},onEnd:p=>{const s=M(p),o=l.innerWidth,r=s/o,h=(p=>d?-p.velocityX:p.velocityX)(p),A=h>=0&&(h>.2||s>o/2),L=(A?1-r:r)*o;let S=0;if(L>5){const T=L/Math.abs(h);S=Math.min(T,540)}g(A,r<=0?.01:(0,_.j)(0,r,.9999),S)}})}},2935:(b,y,c)=>{c.d(y,{w:()=>_});const _=(t,i,a)=>{if(typeof MutationObserver>"u")return;const n=new MutationObserver(e=>{a(f(e,i))});return n.observe(t,{childList:!0,subtree:!0}),n},f=(t,i)=>{let a;return t.forEach(n=>{for(let e=0;e<n.addedNodes.length;e++)a=u(n.addedNodes[e],i)||a}),a},u=(t,i)=>{if(1!==t.nodeType)return;const a=t;return(a.tagName===i.toUpperCase()?[a]:Array.from(a.querySelectorAll(i))).find(e=>e.value===a.value)}},4611:(b,y,c)=>{c.d(y,{u:()=>C});var _=c(467),f=c(2953),u=c(4967),t=c(3953),i=c(3283),a=c(4964),n=c(1182),e=c(4742),v=c(2872),g=c(177),l=c(9141),d=c(4400);const w=["imageContainer"],M=()=>[];function O(m,E){if(1&m){const p=t.RV6();t.j41(0,"ion-chip",7),t.bIt("click",function(){const o=t.eBV(p).$implicit,r=t.XpG();return t.Njj(r.editTag(o))}),t.j41(1,"ion-thumbnail",0),t.nrm(2,"img",8),t.k0s(),t.j41(3,"ion-label"),t.EFF(4),t.k0s(),t.j41(5,"ion-button",9),t.bIt("click",function(o){const r=t.eBV(p).$implicit,h=t.XpG();return t.Njj(h.delTag(o,r.id))}),t.nrm(6,"ion-icon",10),t.k0s()()}if(2&m){const p=E.$implicit;t.R7$(4),t.JRh(p.name)}}let C=(()=>{var m;class E{constructor(s,o,r,h,D,A,P){this.appService=s,this.router=o,this.afAuth=r,this.loading=h,this.modalController=D,this.alert=A,this.navController=P,this.isEditMode=!1,this.outfitData={},this.tags=[],this.title="",this.description="",this.showTag=!1,this.imgCapt="",this.imgFileName="",this.imgUrl="",this.myOutfit=f.v}ngOnInit(){this.resetOutfit(),this.isEditMode&&(this.outfit=this.outfitData,this.imgUrl=this.outfit.imageUrl,this.tags=this.outfit.tags)}resetOutfit(){this.outfit={id:"",title:"",description:"",imageUrl:"",tags:[],gender:"",style:"",season:"",userId:""},this.image=void 0,this.title="",this.description="",this.showTag=!1,this.gender="",this.style="",this.season="",this.color="",this.imgCapt="",this.imgFileName="",this.contentType=null}setImageCaptured(s){var o=this;return(0,_.A)(function*(){if(o.image=s.img,o.imgFileName=s.imgName,o.contentType=s.contentType,o.isEditMode){let r=null;if(o.loading.create({message:"Salvataggio in corso..."}),r=yield o.appService.uploadImage(s.img,o.imgFileName,o.contentType),!r)return;o.outfit.imageUrl=r,o.editOutfit({imageUrl:r})}})()}setImageTagSet(s){var o=this;return(0,_.A)(function*(){if(o.tags=s.tags,o.isEditMode){let r=[...o.tags];r=r.reduce((P,L)=>(P.outfitCategory.includes(L.outfitCategory)||P.outfitCategory.push(L.outfitCategory),P.outfitSubCategory.includes(L.outfitSubCategory)||P.outfitSubCategory.push(L.outfitSubCategory),P.color.includes(L.color)||P.color.push(L.color),P),{outfitCategory:[],outfitSubCategory:[],color:[]});let D={tags:o.tags,editedAt:(new Date).getTime(),...r};(yield o.editOutfit(D))&&(o.outfit.tags=o.tags,o.outfitData.tags=o.tags,o.outfit={...o.outfit,...r})}})()}saveOutfit(s){var o=this;return(0,_.A)(function*(){o.title=s.title,o.color=s.color,o.description=s.description,o.gender=s.gender,o.season=s.season,o.style=s.style;let r=[...o.tags];if(r=r.reduce((h,D)=>(h.outfitCategory.includes(D.outfitCategory)||h.outfitCategory.push(D.outfitCategory),h.outfitSubCategory.includes(D.outfitSubCategory)||h.outfitSubCategory.push(D.outfitSubCategory),h.color.includes(D.color)||typeof D.color<"u"&&h.color.push(D.color),h),{outfitCategory:[],outfitSubCategory:[],color:[]}),o.isEditMode){let D={title:o.title,description:o.description,tags:o.tags,gender:o.gender,style:o.style,season:o.season,color:o.color,editedAt:(new Date).getTime(),...r},A=yield o.editOutfit(D);const P=yield o.afAuth.currentUser,L=null!=P&&P.uid?null==P?void 0:P.uid:"";A&&(o.tags.forEach(function(){var S=(0,_.A)(function*(T){let B={id:T.id,userId:L,name:T.name,outfitCategory:T.outfitCategory,outfitSubCategory:T.outfitSubCategory,brend:T.brend,color:T.color,images:[]};yield o.appService.saveInCollection("wardrobes",void 0,B)});return function(T){return S.apply(this,arguments)}}()),o.handleBackButton())}else o.confirmOutfit()})()}editOutfit(s){var o=this;return(0,_.A)(function*(){let r=o.outfitData.id;return!!(yield o.appService.updateInCollection("outfits",r,s))})()}confirmOutfit(){var s=this;return(0,_.A)(function*(){let o=null;if(!s.title)return;if(!s.image)return;s.loading.create({message:"Salvataggio in corso..."}),o=yield s.appService.uploadImage(s.image,s.imgFileName,s.contentType);const r=yield s.afAuth.currentUser,h=s.generateGUID();if(r){let P=[...s.tags];P=P.reduce((S,T)=>(S.outfitCategory.includes(T.outfitCategory)||S.outfitCategory.push(T.outfitCategory),S.outfitSubCategory.includes(T.outfitSubCategory)||S.outfitSubCategory.push(T.outfitSubCategory),S.color.includes(T.color)||S.color.push(T.color),S),{outfitCategory:[],outfitSubCategory:[],color:[]}),s.outfit={id:h,title:s.title,description:s.description,imageUrl:o,tags:s.tags,gender:s.gender,style:s.style,season:s.season,color:s.color,userId:r.uid,createdAt:(new Date).getTime(),...P}}Math.floor(5*Math.random()),(yield s.appService.saveInCollection("outfits",h,s.outfit))&&s.router.navigate(["/myoutfit"],{skipLocationChange:!0,replaceUrl:!0}).then(P=>{s.resetOutfit(),s.loading.dismiss()})})()}editTag(s){var o=this;return(0,_.A)(function*(){const r=yield o.modalController.create({component:u.H,componentProps:{service:"tagForm",editData:s,title:"Modifica Tag"}});yield r.present();const{data:h}=yield r.onDidDismiss();let D=o.tags.findIndex(B=>B.id==s.id);if(o.tags[D]={id:s.id,name:h.name,x:s.x,y:s.y,link:h.link?h.link:"#",color:h.color,brend:h.brend,outfitCategory:h.outfitCategory,outfitSubCategory:h.outfitSubCategory},!o.outfitData.id)return;let S={tags:o.tags,editedAt:(new Date).getTime()};(yield o.editOutfit(S))&&(o.outfit.tags=o.tags,o.outfitData.tags=o.tags)})()}delTag(s,o){var r=this;return(0,_.A)(function*(){s.preventDefault(),s.stopPropagation(),yield(yield r.alert.create({header:"Attenzione!",message:"Vuoi rimuovere questo tag dell'outfit?",buttons:[{text:"No",role:"cancel",cssClass:"secondary",handler:()=>{}},{text:"Si",handler:()=>{let D=r.tags.findIndex(A=>A.id==o);D>-1&&(r.tags.splice(D,1),r.editOutfit({tags:r.tags}))}}]})).present()})()}generateGUID(){function s(){return Math.floor(65536*(1+Math.random())).toString(16).substring(1)}return`${s()}${s()}-${s()}-${s()}-${s()}-${s()}${s()}${s()}`}handleBackButton(){var s=this;return(0,_.A)(function*(){const o=yield s.modalController.getTop();o?o.dismiss():s.navController.back()})()}}return(m=E).\u0275fac=function(s){return new(s||m)(t.rXU(i.d),t.rXU(a.Ix),t.rXU(n.DS),t.rXU(e.Xi),t.rXU(e.W3),t.rXU(e.hG),t.rXU(v.q9))},m.\u0275cmp=t.VBU({type:m,selectors:[["app-add-outfit"]],viewQuery:function(s,o){if(1&s&&t.GBs(w,5),2&s){let r;t.mGM(r=t.lsd())&&(o.imageContainer=r.first)}},inputs:{isEditMode:"isEditMode",outfitData:"outfitData"},decls:12,vars:8,consts:[["slot","start"],["size","small",3,"click"],["slot","icon-only","name","chevron-back-outline"],[3,"eventFotoCaptured","eventImageTags","eventBeforeFotoCaptured","enableNewImagecaptured","enableSetTagsImage","image","tags"],[1,"chips"],[3,"click",4,"ngFor","ngForOf"],[3,"submitFormEvent","service","editData"],[3,"click"],["alt","Silhouette of a person's head","src","https://ionicframework.com/docs/img/demos/avatar.svg"],["fill","clear","size","small",1,"tag-btn",3,"click"],["slot","icon-only","name","close-circle"]],template:function(s,o){1&s&&(t.j41(0,"ion-header")(1,"ion-toolbar")(2,"ion-buttons",0)(3,"ion-button",1),t.bIt("click",function(){return o.handleBackButton()}),t.nrm(4,"ion-icon",2),t.k0s()(),t.j41(5,"ion-title"),t.EFF(6,"Crea Outfit"),t.k0s()()(),t.j41(7,"ion-content")(8,"app-foto-outfit",3),t.bIt("eventFotoCaptured",function(h){return o.setImageCaptured(h)})("eventImageTags",function(h){return o.setImageTagSet(h)})("eventBeforeFotoCaptured",function(h){return o.setImageCaptured(h)}),t.k0s(),t.j41(9,"section",4),t.DNE(10,O,7,1,"ion-chip",5),t.k0s(),t.j41(11,"app-dynamic-form",6),t.bIt("submitFormEvent",function(h){return o.saveOutfit(h)}),t.k0s()()),2&s&&(t.R7$(8),t.Y8G("enableNewImagecaptured",!0)("enableSetTagsImage",!0)("image",!0===o.isEditMode?o.imgUrl:void 0)("tags",!0===o.isEditMode?o.tags:t.lJ4(7,M)),t.R7$(2),t.Y8G("ngForOf",o.tags),t.R7$(),t.Y8G("service","outfitForm")("editData",o.outfitData))},dependencies:[g.Sq,l.f,e.Jm,e.QW,e.ZB,e.W9,e.eU,e.iq,e.he,e.Zx,e.BC,e.ai,d.R],styles:[".chips[_ngcontent-%COMP%]{font-size:11px!important}.chips[_ngcontent-%COMP%]   .tag-btn[_ngcontent-%COMP%]{font-size:11px;color:var(--outfit-primary-color);margin:1px 2px;padding:0}"]}),E})()},7228:(b,y,c)=>{c.d(y,{P:()=>t});var _=c(177),f=c(4742),u=c(3953);let t=(()=>{var i;class a{}return(i=a).\u0275fac=function(e){return new(e||i)},i.\u0275mod=u.$C({type:i}),i.\u0275inj=u.G2t({imports:[_.MD,f.bv]}),a})()}}]);