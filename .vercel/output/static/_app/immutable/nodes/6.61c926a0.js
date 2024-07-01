import{s as R,e as C,a as L,z as V,c as D,h as d,d as N,b as $,g as H,i as y,k as S,j as E,x as z,l as G,m as M,t as U,f as j,A as q,u as O,o as W,p as J,n as A}from"../chunks/scheduler.ccf898a6.js";import{S as K,i as Q,a as T,c as X,t as w,g as Y}from"../chunks/index.7272c3b3.js";import{p as Z}from"../chunks/stores.54c459da.js";import{p as x}from"../chunks/posts.daf0f58d.js";import{g as tt}from"../chunks/navigation.58f74453.js";function et(r){var v;let s,o=((v=r[0].parsedDate)==null?void 0:v.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}))+"",i,_,u,a=r[0].title+"",p,n,m;const c=r[3].default,e=M(c,r,r[2],null);return{c(){s=C("div"),i=U(o),_=L(),u=C("h1"),p=U(a),n=L(),e&&e.c(),this.h()},l(t){s=D(t,"DIV",{class:!0});var f=$(s);i=j(f,o),f.forEach(d),_=N(t),u=D(t,"H1",{});var b=$(u);p=j(b,a),b.forEach(d),n=N(t),e&&e.l(t),this.h()},h(){y(s,"class","text-sm text-accent")},m(t,f){E(t,s,f),S(s,i),E(t,_,f),E(t,u,f),S(u,p),E(t,n,f),e&&e.m(t,f),m=!0},p(t,f){var b;(!m||f&1)&&o!==(o=((b=t[0].parsedDate)==null?void 0:b.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}))+"")&&q(i,o),(!m||f&1)&&a!==(a=t[0].title+"")&&q(p,a),e&&e.p&&(!m||f&4)&&O(e,c,t,t[2],m?J(c,t[2],f,null):W(t[2]),null)},i(t){m||(w(e,t),m=!0)},o(t){T(e,t),m=!1},d(t){t&&(d(s),d(_),d(u),d(n)),e&&e.d(t)}}}function st(r){let s,o="Post not found";return{c(){s=C("h1"),s.textContent=o},l(i){s=D(i,"H1",{"data-svelte-h":!0}),H(s)!=="svelte-1rpxqk3"&&(s.textContent=o)},m(i,_){E(i,s,_)},p:A,i:A,o:A,d(i){i&&d(s)}}}function lt(r){var F;let s,o,i,_,u,a,p,n="← Back to Features",m,c,e,v,t,f;document.title=s=(F=r[0])!=null&&F.title?r[0].title:"Not Found";const b=[st,et],k=[];function B(l,h){return l[0]==null?0:1}return c=B(r),e=k[c]=b[c](r),{c(){o=C("meta"),_=L(),u=C("div"),a=C("article"),p=C("button"),p.textContent=n,m=L(),e.c(),this.h()},l(l){const h=V("svelte-1n3d36v",document.head);o=D(h,"META",{name:!0,content:!0}),h.forEach(d),_=N(l),u=D(l,"DIV",{class:!0});var I=$(u);a=D(I,"ARTICLE",{class:!0});var g=$(a);p=D(g,"BUTTON",{class:!0,"data-svelte-h":!0}),H(p)!=="svelte-1wey5ks"&&(p.textContent=n),m=N(g),e.l(g),g.forEach(d),I.forEach(d),this.h()},h(){var l;y(o,"name","description"),y(o,"content",i=(l=r[0])!=null&&l.description?r[0].description:"features post"),y(p,"class","btn btn-primary mb-6"),y(a,"class","prose mx-auto"),y(u,"class","py-12 px-6 font-sans")},m(l,h){S(document.head,o),E(l,_,h),E(l,u,h),S(u,a),S(a,p),S(a,m),k[c].m(a,null),v=!0,t||(f=z(p,"click",r[1]),t=!0)},p(l,[h]){var g,P;(!v||h&1)&&s!==(s=(g=l[0])!=null&&g.title?l[0].title:"Not Found")&&(document.title=s),(!v||h&1&&i!==(i=(P=l[0])!=null&&P.description?l[0].description:"features post"))&&y(o,"content",i);let I=c;c=B(l),c===I?k[c].p(l,h):(Y(),T(k[I],1,1,()=>{k[I]=null}),X(),e=k[c],e?e.p(l,h):(e=k[c]=b[c](l),e.c()),w(e,1),e.m(a,null))},i(l){v||(w(e),v=!0)},o(l){T(e),v=!1},d(l){l&&(d(_),d(u)),d(o),k[c].d(),t=!1,f()}}}function at(r,s,o){let i;G(r,Z,n=>o(4,i=n));let{$$slots:_={},$$scope:u}=s,a=null;for(const n of x)if(i.url.pathname==n.link||i.url.pathname==n.link+"/"){a=n;continue}if(a!=null){let n=a.date.split("-");a.parsedDate=new Date(parseInt(n[0]),parseInt(n[1])-1,parseInt(n[2]))}else console.log("WARNING: rendering features post, which is not listed in posts.json");function p(){tt("/features")}return r.$$set=n=>{"$$scope"in n&&o(2,u=n.$$scope)},[a,p,u,_]}class ct extends K{constructor(s){super(),Q(this,s,at,lt,R,{})}}export{ct as component};
