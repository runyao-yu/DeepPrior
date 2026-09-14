#!/usr/bin/env python3
"""Idempotent, guarded edits to the compiled DeepPrior bundle.

Run with `npm run patch:bundle` (safe to re-run). Each edit asserts that its
anchor text occurs exactly once, or is skipped when already applied.

1. `engine` section (Intelligent Electricity Market Engine) — own scroll trigger,
   shared first-page renderer state, scroll-indicator entry.
2. Paper carousel — portrait (1:√2) cover frame instead of the 16:9 screen, and
   data-URL cover textures (generated at runtime from a model figure + title).
3. Hidden Service / stellla sections — null-guarded trigger registration, and a
   footer-state trigger on the outro wrapper so the header/indicator still hide.
"""
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "public/_astro/index.astro_astro_type_script_index_0_lang.Cu0uHvXK.js")
s = open(path, encoding="utf-8").read()
orig = s


def replace_once(old, new, label, applied=(), optional=False):
    """`applied`: extra substrings that prove a later patch already superseded this one.
    `optional`: silently skip when the anchor is absent (migration of an older patch state)."""
    global s
    if new in s or any(marker in s for marker in applied):
        print(f"[skip] {label} already applied")
        return
    if optional and old not in s:
        return
    assert s.count(old) == 1, f"{label}: expected exactly one match, found {s.count(old)}"
    s = s.replace(old, new)
    print(f"[ok] {label}")


# ---------------------------------------------------------------- 1. engine section
replace_once(
    'const sectionNames=["kv","works_intro",',
    'const sectionNames=["kv","engine","works_intro",',
    "engine: sectionNames",
)
replace_once(
    'onEnterBack:()=>this._onSectionEnter("kv","enterBack")});const o=document.querySelector(\'[data-top_section="works_intro"]\');',
    'onEnterBack:()=>this._onSectionEnter("kv","enterBack")});'
    'const engineEl=document.querySelector(\'[data-top_section="engine"]\');'
    'engineEl&&this.registerSection("engine",engineEl,{triggerId:"top_engine",pathname:"/",trigger:engineEl,start:"top bottom",end:"bottom bottom",'
    'onEnter:()=>this._onSectionEnter("engine","enter"),onEnterBack:()=>this._onSectionEnter("engine","enterBack")});'
    'const o=document.querySelector(\'[data-top_section="works_intro"]\');',
    "engine: trigger",
)
replace_once(
    'changeSection(i){const o=i=="mission"?"kv":i;this.mainLogo.changeSection(o)',
    'changeSection(i){const o=i=="mission"||i=="engine"?"kv":i;this.mainLogo.changeSection(o)',
    "engine: renderer state mapping",
    applied=('const o=i=="mission"||i=="engine"||i=="vision"?"kv":i;',),
)
replace_once(
    'const topScrollSections=[{id:"kv",label:"TOP",scrollTriggerIds:["works_intro"],subsections:[{index:0},{index:1}]},',
    'const topScrollSections=[{id:"kv",label:"TOP",scrollTriggerIds:["engine"],subsections:[{index:0},{index:1}]},'
    '{id:"engine",label:"ENGINE",scrollTriggerIds:["engine","works_intro"],subsections:[{index:0},{index:1}]},',
    "engine: scroll indicator",
)

# ---------------------------------------------------------------- 2. portrait paper covers
replace_once(
    '#define MESH_ASPECT ( 16.0 / 9.0 )\nvarying vec2 vUv;varying vec2 vMeshUv;varying float vFunya;',
    '#define MESH_ASPECT ( 0.7071 )\nvarying vec2 vUv;varying vec2 vMeshUv;varying float vFunya;',
    "papers: texture fit aspect",
)
replace_once(  # migration from the earlier curved-screen variant of this patch
    'if(g)this._mesh=new Mesh(g.geometry,p),this._mesh.scale.set(0.7071/(16/9)*1.18,1.18,1),this._mesh.name="worksThumbnail_"+this.uuid,this.add(this._mesh);',
    'if(g)this._mesh=new Mesh(new PlaneGeometry(8,4.5,32,32),p),this._mesh.scale.set(0.7071/(16/9)*1.18,1.18,1),this._mesh.name="worksThumbnail_"+this.uuid,this.add(this._mesh);',
    "papers: flat portrait page (migrate)",
    optional=True,
)
replace_once(
    'if(g)this._mesh=new Mesh(g.geometry,p),this._mesh.name="worksThumbnail_"+this.uuid,this.add(this._mesh);',
    'if(g)this._mesh=new Mesh(new PlaneGeometry(8,4.5,32,32),p),this._mesh.scale.set(0.7071/(16/9)*1.18,1.18,1),this._mesh.name="worksThumbnail_"+this.uuid,this.add(this._mesh);',
    "papers: flat portrait page",
)
replace_once(
    'textureLoader.load(c+"?w=1024",m=>{m.wrapS=MirroredRepeatWrapping',
    'textureLoader.load(c.startsWith("data:")?c:c+"?w=1024",m=>{m.wrapS=MirroredRepeatWrapping',
    "papers: data-url textures",
)

# ---------------------------------------------------------------- 3. hidden service / stellla
replace_once(
    'const v=document.querySelector(\'[data-top_section="vision_out"]\');this.registerSection("vision_out",v,',
    'const v=document.querySelector(\'[data-top_section="vision_out"]\');v&&this.registerSection("vision_out",v,',
    "hidden: vision_out guard",
)
replace_once(
    'const y=document.querySelector(\'[data-section_wrap="vision_service"]\');this.registerSection("vision_service_wrap",y,',
    'const y=document.querySelector(\'[data-section_wrap="vision_service"]\');y&&this.registerSection("vision_service_wrap",y,',
    "hidden: vision_service_wrap guard",
)
replace_once(
    'const b=document.querySelector(\'[data-top_section="service_in"]\');this.registerSection("service_in",b,',
    'const b=document.querySelector(\'[data-top_section="service_in"]\');b&&this.registerSection("service_in",b,',
    "hidden: service_in guard",
)
replace_once(
    'const S=document.querySelector(\'[data-top_section="service"]\'),C=S.querySelectorAll("[data-service_scroll_item]");this.registerSection("service_snap",S,',
    'const S=document.querySelector(\'[data-top_section="service"]\'),C=S?S.querySelectorAll("[data-service_scroll_item]"):[];S&&this.registerSection("service_snap",S,',
    "hidden: service guard (snap)",
)
replace_once(
    '}),this.registerSection("service_progress",S,{triggerId:"top_service_progress"',
    '}),S&&this.registerSection("service_progress",S,{triggerId:"top_service_progress"',
    "hidden: service guard (progress)",
)
replace_once(
    'const E=document.querySelector(\'[data-service_scroll_item="stellla"]\');this.registerSection("stellla_in",E,',
    'const E=document.querySelector(\'[data-service_scroll_item="stellla"]\');E&&this.registerSection("stellla_in",E,',
    "hidden: stellla_in guard",
)
replace_once(
    'const P=document.querySelector(\'[data-top_section="stellla"]\');this.registerSection("stellla",P,{triggerId:"top_stellla",pathname:"/",trigger:P,start:"top bottom",end:"bottom bottom",snap:{snapTo:[.9],duration:1,directional:!1},onEnterBack:()=>this._onSectionEnter("stellla","enterBack"),onLeave:()=>this._onSectionEnter("footer","enter")})}',
    'const P=document.querySelector(\'[data-top_section="stellla"]\');P&&this.registerSection("stellla",P,{triggerId:"top_stellla",pathname:"/",trigger:P,start:"top bottom",end:"bottom bottom",snap:{snapTo:[.9],duration:1,directional:!1},onEnterBack:()=>this._onSectionEnter("stellla","enterBack"),onLeave:()=>this._onSectionEnter("footer","enter")});'
    'const OUTRO=document.querySelector("[data-outro-wrapper]");!P&&OUTRO&&this.registerSection("outro_in",OUTRO,{triggerId:"top_outro_in",pathname:"/",trigger:OUTRO,start:"top bottom",end:"bottom bottom",onEnter:()=>this._onSectionEnter("footer","enter"),onLeaveBack:()=>this._onSectionEnter("vision","enterBack")})}',
    "hidden: stellla guard + outro footer state",
)

replace_once(
    'get triggerName(){return"vision"}get outTriggerName(){return"vision_out"}',
    'get triggerName(){return"vision"}get outTriggerName(){return topScrollManager.getTrigger("vision_out")?"vision_out":"outro_in"}',
    "hidden: vision fade-out uses the outro trigger when vision_out is absent",
)

replace_once(
    'const p=document.querySelector(\'[data-top_section="works_outro"]\');this.registerSection("works_outro",p,',
    'const papersEl=document.querySelector(\'[data-top_section="papers"]\');papersEl&&this.registerSection("papers",papersEl,{triggerId:"top_papers",pathname:"/",trigger:papersEl,start:"top bottom",end:"bottom bottom",onEnter:()=>this._onSectionEnter("papers","enter"),onEnterBack:()=>this._onSectionEnter("papers","enterBack")});'
    'const p=document.querySelector(\'[data-top_section="works_outro"]\');this.registerSection("works_outro",p,',
    "papers: index section trigger",
)
replace_once(
    'const sectionNames=["kv","engine","works_intro","works","works_outro",',
    'const sectionNames=["kv","engine","works_intro","works","papers","works_outro",',
    "papers: sectionNames",
)

# ---------------------------------------------------------------- 4. About page on the hero renderer, no loading animation
replace_once(
    'changeSection(i){const o=i=="mission"||i=="engine"?"kv":i;this.mainLogo.changeSection(o)',
    'changeSection(i){const o=i=="mission"||i=="engine"||i=="vision"?"kv":i;this.mainLogo.changeSection(o)',
    "about: renderer state mapping (vision -> kv)",
)
replace_once(
    'visibleMission:document.body.getAttribute("data-current_section")=="mission"?0:this._missionTrigger?',
    'visibleMission:["mission","vision","footer"].includes(document.body.getAttribute("data-current_section"))?0:this._missionTrigger?',
    "about: no light mission blend on the About page",
)
replace_once(
    'visibleVision:this._visionTrigger?lerper.set("vision_renderer",this._visionTrigger.progress):0,',
    'visibleVision:0,',
    "about: no light vision blend",
)
replace_once(
    'lerper.set("cameraController_worksOutro",document.body.getAttribute("data-current_section")=="mission"?0:',
    'lerper.set("cameraController_worksOutro",["mission","vision"].includes(document.body.getAttribute("data-current_section"))?0:',
    "about: camera framing like the first page",
)
replace_once(
    'lerper.set("worksOutro_progress",document.body.getAttribute("data-current_section")=="mission"?0:',
    'lerper.set("worksOutro_progress",["mission","vision"].includes(document.body.getAttribute("data-current_section"))?0:',
    "about: works-outro blend neutral on About",
)
replace_once(  # revert: the 3 s triangle entrance stays (an earlier revision shortened it)
    'onLoadingComplete(i=!1){this._animator.animate("loaded",1,0),',
    'onLoadingComplete(i=!1){this._animator.animate("loaded",1,i?0:3),',
    "loading: keep the original 3 s scene entrance",
    optional=True,
)
replace_once(
    'onLoadingComplete(i=!1){this._animator.animate("loaded",1,i?0:.8),',
    'onLoadingComplete(i=!1){this._animator.animate("loaded",1,i?0:3),',
    "loading: keep the original 3 s scene entrance (migrate)",
    optional=True,
)

# ---------------------------------------------------------------- 5. flat paper covers, instant first frame
replace_once(  # migration from the concave variant
    'pos.z*=0.2;pos.z+=0.42-cos(pos.x/4.0*PI/2.0*0.5)*0.55;vUv=uv;vMeshUv=uv;',
    'pos.z*=0.2;pos.z+=cos(pos.x/4.0*PI/2.0*0.5)*0.6-0.42;vUv=uv;vMeshUv=uv;',
    "papers: page bends toward the viewer (migrate)",
    optional=True,
)
replace_once(  # migration from the inward-bending variant
    'pos.z*=0.2;pos.z+=cos(pos.x/4.0*PI/2.0*0.5)*0.35-0.25;vUv=uv;vMeshUv=uv;',
    'pos.z*=0.2;pos.z+=cos(pos.x/4.0*PI/2.0*0.5)*0.6-0.42;vUv=uv;vMeshUv=uv;',
    "papers: bending outward (migrate)",
    optional=True,
)
replace_once(
    'pos.z*=0.2;pos.z+=cos(pos.x/4.0*PI/2.0*0.5)*1.5-1.0;vUv=uv;vMeshUv=uv;',
    'pos.z*=0.2;pos.z+=cos(pos.x/4.0*PI/2.0*0.5)*0.6-0.42;vUv=uv;vMeshUv=uv;',
    "papers: page bends toward the viewer",
    applied=("pos.z+=cos(pos.x/4.0*PI/2.0*0.5)*0.6-0.42;",),
)
replace_once(  # migration from the faint-fringe variant
    'vec2 cuv=uv-0.5;cuv*=1.0;float distBase=0.012+fi*0.006;',
    'vec2 cuv=uv-0.5;cuv*=1.0;float distBase=0.0;',
    "papers: no lens distortion (migrate)",
    optional=True,
)
replace_once(
    'vec2 cuv=uv-0.5;cuv*=1.3;cuv.x*=0.9;float distBase=0.1+fi*0.03;',
    'vec2 cuv=uv-0.5;cuv*=1.0;float distBase=0.0;',
    "papers: no lens distortion (frame and sheet aligned)",
    applied=("float distBase=0.0;",),
)

replace_once(
    'col.xyz/=4.0;col.w=1.0;col.xyz*=smoothstep(0.9,0.49,length(meshCuv));col.w*=uLoaded;',
    'col.xyz/=4.0;col.w=1.0;col.xyz*=smoothstep(0.54,0.47,max(abs(meshCuv.x),abs(meshCuv.y)));col.w*=uLoaded;',
    "papers: edge shading follows the page instead of a radial vignette",
    applied=("smoothstep(0.54,0.47,max(abs(meshCuv.x),abs(meshCuv.y)))",),
)

replace_once(
    'await loadingUIController.waitForProgressComplete(),c.from.url!=="/"&&gl.onLoadingComplete(!0),await loadingUIController.hide(),c.from.url=="/"&&gl.onLoadingComplete()})()',
    'await loadingUIController.waitForProgressComplete(),c.from.url!=="/"&&gl.onLoadingComplete(!0),c.from.url=="/"&&gl.onLoadingComplete(),await loadingUIController.hide()})()',
    "loading: scene entrance starts under the fading cover",
)

replace_once(
    'col.x+=texture2D(uTex,lens_distortion(cuv,distBase+0.1)+0.5+normalOffset*1.0).x;col.y+=texture2D(uTex,lens_distortion(cuv,distBase+0.12)+0.5+normalOffset*1.01).y;col.z+=texture2D(uTex,lens_distortion(cuv,distBase+0.14)+0.5+normalOffset*1.02).z;',
    'col.x+=texture2D(uTex,cuv+0.5).x;col.y+=texture2D(uTex,cuv+0.5).y;col.z+=texture2D(uTex,cuv+0.5).z;',
    "papers: sample the cover flat (no per-channel lens offsets)",
)

# ---------------------------------------------------------------- 6. loading: no choreography, cover lifts as soon as assets are ready
replace_once(
    'this._currentPageName==="top"?this._realProgress>=.999&&o>=.999&&Math.abs(this._currentTime-this._targetTime)<.01&&(this._isProgressComplete=!0,this._startLogoAnimation()):this._realProgress>=.999&&(this._isProgressComplete=!0,this._startLogoAnimation())',
    'this._realProgress>=.999&&(this._isProgressComplete=!0,this._completeProgress())',
    "loading: resolve as soon as assets + shaders are ready (skip the Lottie choreography)",
)
replace_once(
    'gsapWithCSS.to(this._overlay,{opacity:0,duration:.8,ease:"power2.out",onComplete:async()=>{this._overlay&&this._overlay.setAttribute("data-hidden","")',
    'gsapWithCSS.to(this._overlay,{opacity:0,duration:.3,ease:"power2.out",onComplete:async()=>{this._overlay&&this._overlay.setAttribute("data-hidden","")',
    "loading: 0.3 s cover fade",
)

replace_once(
    'col.x+=texture2D(uTex,cuv+0.5).x;col.y+=texture2D(uTex,cuv+0.5).y;col.z+=texture2D(uTex,cuv+0.5).z;}col.xyz/=4.0;col.w=1.0;',
    'col.x+=texture2D(uTex,cuv+0.5).x;col.y+=texture2D(uTex,cuv+0.5).y;col.z+=texture2D(uTex,cuv+0.5).z;}col.xyz/=4.0;col.w=texture2D(uTex,clamp(uv,0.0,1.0)).a;',
    "papers: cover alpha (glass frame, rounded corners)",
)

if s != orig:
    open(path, "w", encoding="utf-8").write(s)
    print("bundle written")
else:
    print("bundle unchanged")
