/* Nomad AI — application shell.
   Port of the "Nomad AI App v2" design prototype to a plain web app.

   The design ran on a React-based canvas runtime whose templates use
   {{ }} interpolation with <sc-if> and <sc-for> for structure. Rather than
   hand-translating 1 300 lines of markup into JS — and drifting from the
   approved design in the process — the template below is the prototype's
   markup verbatim, and this file carries a small runtime that renders it:

     · render()  turns the template plus a values object into fresh DOM
     · morph()   patches that into the live tree, so inputs keep focus and
                 caret, filled image slots do not flash, and running
                 animations are not restarted by an unrelated state change
     · buildVals() is the prototype's renderVals(), ported unchanged apart
                 from the platform switch, which is local state here because
                 there is no design-canvas props panel to drive it

   Content tables live in data.js, badge artwork in badges.js. */
(function () {
  'use strict';

  var D = window.NOMAD_DATA;

  var TEMPLATE = `
  <div class="nomPage {{ themeClass }}" style="min-height:100vh;background:var(--pagebg);color:var(--ink);padding:30px 28px 44px;font-family:'Plus Jakarta Sans',system-ui,sans-serif;transition:background .3s,color .3s">

    <div class="nomDemoChrome" style="max-width:1080px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:22px;margin-bottom:26px">
      <div style="display:flex;align-items:center;gap:12px">
        <div style="line-height:0">{{ logoMarkSmall }}</div>
        <div style="line-height:0">{{ logoWordSmall }}</div>
      </div>
      <div style="display:flex;align-items:center;gap:9px">
        <div style="display:flex;gap:3px;padding:3px;border-radius:99px;background:var(--surface);border:1px solid var(--line)">
          <div onClick="{{ setLight }}" style="{{ lightCss }}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="4.2" stroke-width="1.9"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6" stroke-width="1.9" stroke-linecap="round"/></svg>
            Light
          </div>
          <div onClick="{{ setDark }}" style="{{ darkCss }}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" stroke-width="1.9" stroke-linejoin="round"/></svg>
            Dark
          </div>
        </div>
        <div style="display:flex;gap:3px;padding:3px;border-radius:99px;background:var(--surface);border:1px solid var(--line)">
          <div onClick="{{ setIos }}" style="{{ iosCss }}">iOS</div>
          <div onClick="{{ setAndroid }}" style="{{ androidCss }}">Android</div>
        </div>
      </div>
    </div>
  
    <div class="nomStage" style="max-width:1080px;margin:0 auto;display:flex;flex-direction:column;align-items:center;gap:22px">

      <div class="nomScroll nomChips" style="display:flex;gap:7px;overflow-x:auto;max-width:100%;padding:4px">
        <sc-for list="{{ chips }}" as="c" hint-placeholder-count="8">
          <div onClick="{{ c.go }}" style="{{ c.css }}">{{ c.name }}</div>
        </sc-for>
      </div>
  
      <div class="nomBezel" style="position:relative;width:417px;height:876px;border-radius:56px;padding:12px;background:var(--bezel);box-shadow:0 30px 70px rgba(27,20,17,.22), 0 0 0 1px rgba(27,20,17,.06);transition:background .3s">
        <div class="nomScreen" style="position:relative;width:393px;height:852px;border-radius:45px;overflow:hidden;background:var(--bg);display:flex;flex-direction:column;transition:background .3s">
  
          <sc-if value="{{ isIos }}" hint-placeholder-val="{{ true }}">
            <div class="nomFakeStatus" style="position:relative;z-index:6;height:52px;flex:0 0 52px;display:flex;align-items:flex-end;justify-content:space-between;padding:0 30px 8px;font-size:14px;font-weight:700;color:var(--ink)">
              <div>9:41</div>
              <div style="position:absolute;left:50%;top:9px;transform:translateX(-50%);width:110px;height:31px;border-radius:20px;background:#0B0706"></div>
              <div style="display:flex;align-items:center;gap:6px;color:var(--ink)">
                <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5.5" width="3" height="6.5" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1" opacity=".35"/></svg>
                <svg width="16" height="12" viewBox="0 0 16 12" fill="none" stroke="currentColor"><path d="M8 10.5 1 4.2a10 10 0 0 1 14 0L8 10.5Z" stroke-width="1.4" stroke-linejoin="round"/></svg>
                <svg width="26" height="13" viewBox="0 0 26 13" fill="none"><rect x=".7" y=".7" width="21" height="11.6" rx="3.4" stroke="currentColor" stroke-opacity=".45" stroke-width="1.1"/><rect x="2.4" y="2.4" width="15" height="8.2" rx="2" fill="currentColor"/><path d="M23.4 4.4v4.2a2.4 2.4 0 0 0 0-4.2Z" fill="currentColor" fill-opacity=".45"/></svg>
              </div>
            </div>
          </sc-if>
          <sc-if value="{{ isAndroid }}">
            <div class="nomFakeStatus" style="position:relative;z-index:6;height:40px;flex:0 0 40px;display:flex;align-items:center;justify-content:space-between;padding:0 20px;font-size:13px;font-weight:700;color:var(--ink)">
              <div>14:20</div>
              <div style="display:flex;align-items:center;gap:7px;color:var(--ink)">
                <svg width="15" height="11" viewBox="0 0 16 12" fill="none" stroke="currentColor"><path d="M8 10.5 1 4.2a10 10 0 0 1 14 0L8 10.5Z" stroke-width="1.4" stroke-linejoin="round"/></svg>
                <svg width="16" height="11" viewBox="0 0 18 12" fill="currentColor"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5.5" width="3" height="6.5" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1" opacity=".35"/></svg>
                <svg width="11" height="13" viewBox="0 0 12 14" fill="currentColor"><rect x="3" y="0" width="6" height="2" rx="1"/><rect x=".8" y="1.8" width="10.4" height="11.4" rx="2.4"/></svg>
              </div>
            </div>
          </sc-if>
  
          <div ref="{{ scrollRef }}" class="nomScroll" style="flex:1;overflow-y:auto;overflow-x:hidden">
            <div ref="{{ screenRef }}" style="min-height:100%">
  
              <sc-if value="{{ isHome }}" hint-placeholder-val="{{ true }}">
                <div data-screen-label="Home" style="padding:8px 0 32px;display:flex;flex-direction:column;gap:32px">
  
                  <div style="padding:0 22px;display:flex;flex-direction:column;gap:18px">
                    <div style="display:flex;align-items:center;justify-content:space-between;gap:14px">
                      <div>
                        <div style="font-size:13px;font-weight:600;color:var(--ink3)">{{ t.hello }}, {{ first }}</div>
                        <div style="margin-top:3px;font-size:25px;font-weight:800;letter-spacing:-.035em;color:var(--ink);line-height:1.15">{{ t.awaits }}</div>
                      </div>
                      <div onClick="{{ goProfile }}" role="button" tabIndex="0" aria-label="Profile" style="width:46px;height:46px;flex:0 0 46px;border-radius:50%;background:var(--brandSoft);border:1px solid var(--line);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;color:var(--brand);cursor:pointer">{{ initials }}</div>
                    </div>
  
                    <div onClick="{{ goSearch }}" style="display:flex;align-items:center;gap:13px;height:58px;padding:0 20px;border-radius:19px;background:var(--surface);border:1px solid var(--line);box-shadow:var(--shadow);cursor:pointer">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color:var(--ink2);flex:0 0 20px"><circle cx="11" cy="11" r="7" stroke-width="2"/><path d="M16.5 16.5 21 21" stroke-width="2" stroke-linecap="round"/></svg>
                      <div style="flex:1;font-size:15px;font-weight:500;color:var(--ink3)">{{ t.searchPlaceholder }}</div>
                    </div>
  
                    <div onClick="{{ goAi }}" role="button" tabIndex="0" style="display:flex;align-items:center;justify-content:center;gap:10px;height:58px;border-radius:19px;background:var(--brand);cursor:pointer;box-shadow:var(--shadowLg)">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style="color:var(--brandInk);flex:0 0 20px"><path d="M12 3.2l2 5.4 5.4 2-5.4 2-2 5.4-2-5.4-5.4-2 5.4-2 2-5.4Z" fill="currentColor"/><path d="M18.6 15.4l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z" fill="currentColor"/></svg>
                      <div style="font-size:16.5px;font-weight:700;letter-spacing:-.01em;color:var(--brandInk)">{{ t.planMyTrip }}</div>
                    </div>
  
                    <sc-if value="{{ hasNext }}">
                      <div onClick="{{ goNext }}" role="button" tabIndex="0" style="display:flex;align-items:center;gap:14px;padding:15px 16px;border-radius:19px;background:var(--surface);border:1px solid var(--line);box-shadow:var(--shadow);cursor:pointer">
                        <div style="flex:0 0 auto;line-height:0">{{ nextArt }}</div>
                        <div style="flex:1;min-width:0">
                          <div style="font-size:10.5px;font-weight:800;letter-spacing:.12em;color:var(--brand)">{{ t.keepGoing }}</div>
                          <div style="margin-top:5px;font-size:15px;font-weight:800;letter-spacing:-.022em;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ nextName }}</div>
                          <div style="margin-top:8px;height:6px;border-radius:99px;background:var(--surface2);overflow:hidden"><div style="width:{{ nextPct }};height:100%;border-radius:99px;background:var(--green);transition:width .4s"></div></div>
                          <div style="margin-top:7px;font-size:11.5px;color:var(--ink3)">{{ nextProg }} · {{ nextWorth }}</div>
                        </div>
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color:var(--ink3);flex:0 0 17px"><path d="M9 5l7 7-7 7" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                      </div>
                    </sc-if>
                  </div>
  
                  <!-- ── Open right now ──────────────────────────────────────────
                       The question at seven in the evening is not "what is good
                       in Bishkek" but "what is open, near me, now". Worked out
                       on the device from the hours, the ratings and the
                       position — no model call, and it answers with no signal. -->
                  <sc-if value="{{ hasOpenNow }}">
                    <div style="padding:0 22px;display:flex;flex-direction:column;gap:11px">
                      <div style="display:flex;align-items:center;gap:8px">
                        <span style="width:7px;height:7px;border-radius:99px;background:var(--green);flex:0 0 7px"></span>
                        <div style="font-size:19px;font-weight:800;letter-spacing:-.028em;color:var(--ink)">{{ t.openNow }}</div>
                        <div style="font-size:12px;font-weight:600;color:var(--ink3)">{{ openNowSub }}</div>
                      </div>
                      <div style="display:flex;flex-direction:column;gap:8px">
                        <sc-for list="{{ openNow }}" as="o" hint-placeholder-count="3">
                          <div onClick="{{ o.go }}" role="button" tabIndex="0" style="display:flex;align-items:center;gap:11px;padding:8px;border-radius:15px;background:var(--surface);border:1px solid var(--line);box-shadow:var(--shadow);cursor:pointer">
                            <div style="width:46px;height:46px;flex:0 0 46px;border-radius:11px;overflow:hidden;background:var(--imgbg)">
                              <image-slot id="{{ o.slot }}" shape="rect" placeholder="{{ o.ph }}"></image-slot>
                            </div>
                            <div style="flex:1;min-width:0">
                              <div style="font-size:14px;font-weight:700;letter-spacing:-.02em;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ o.name }}</div>
                              <div style="margin-top:2px;display:flex;align-items:center;gap:5px;font-size:11.5px;color:var(--ink2);white-space:nowrap">
                                <span style="{{ o.dot }}"></span><span>{{ o.cat }}</span>
                                <sc-if value="{{ o.hasDist }}"><span>·</span><span style="font-weight:700;color:var(--brand)">{{ o.dist }}</span></sc-if>
                              </div>
                            </div>
                            <div style="{{ o.shutCss }}">{{ o.shut }}</div>
                          </div>
                        </sc-for>
                      </div>
                    </div>
                  </sc-if>

                  <div style="display:flex;flex-direction:column;gap:15px">
                    <div style="padding:0 22px;display:flex;align-items:center;justify-content:space-between">
                      <div style="font-size:19px;font-weight:800;letter-spacing:-.028em;color:var(--ink)">{{ t.nearby }}</div>
                      <div onClick="{{ goSearch }}" style="font-size:13px;font-weight:700;color:var(--brand);cursor:pointer">{{ t.seeAll }}</div>
                    </div>
                    <div class="nomScroll" style="display:flex;gap:14px;overflow-x:auto;padding:0 22px 6px">
                      <sc-for list="{{ nearby }}" as="n" hint-placeholder-count="4">
                        <div onClick="{{ n.go }}" style="flex:0 0 148px;cursor:pointer">
                          <div style="height:148px;border-radius:18px;overflow:hidden;background:var(--imgbg);box-shadow:var(--shadow)">
                            <image-slot id="{{ n.slot }}" shape="rect" placeholder="{{ n.ph }}"></image-slot>
                          </div>
                          <div style="margin-top:11px;font-size:14.5px;font-weight:700;letter-spacing:-.02em;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ n.name }}</div>
                          <div style="margin-top:4px;display:flex;align-items:center;gap:6px;font-size:12.5px;color:var(--ink2)">
                            <svg width="12" height="12" viewBox="0 0 24 24" style="color:var(--gold);flex:0 0 12px" fill="currentColor"><path d="M3 6.8h18l-1.5 6.9A8.4 8.4 0 0 1 12 20.5a8.4 8.4 0 0 1-7.5-6.8L3 6.8Z"/><rect x="7.4" y="21.3" width="9.2" height="2" rx="1"/></svg>
                            <span style="font-weight:700;color:var(--ink)">{{ n.rating }}</span>
                            <span>·</span><span>{{ n.dist }}</span>
                          </div>
                        </div>
                      </sc-for>
                    </div>
                  </div>
  
                  <div style="display:flex;flex-direction:column;gap:15px">
                    <div style="padding:0 22px;font-size:19px;font-weight:800;letter-spacing:-.028em;color:var(--ink)">{{ t.popular }}</div>
                    <div class="nomScroll" style="display:flex;gap:14px;overflow-x:auto;padding:0 22px 6px">
                      <sc-for list="{{ popular }}" as="p" hint-placeholder-count="3">
                        <div onClick="{{ p.go }}" style="position:relative;flex:0 0 218px;height:262px;border-radius:20px;overflow:hidden;cursor:pointer;box-shadow:var(--shadowLg);background:var(--imgbg)">
                          <image-slot id="{{ p.slot }}" shape="rect" placeholder="{{ p.ph }}"></image-slot>
                          <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(20,14,12,0) 42%,rgba(20,14,12,.86));pointer-events:none"></div>
                          <div style="position:absolute;bottom:0;left:0;right:0;padding:16px;pointer-events:none">
                            <div style="font-size:18px;font-weight:800;letter-spacing:-.03em;color:#FFF;line-height:1.2">{{ p.name }}</div>
                            <div style="margin-top:5px;font-size:12.5px;font-weight:600;color:rgba(255,255,255,.82)">{{ p.meta }}</div>
                          </div>
                        </div>
                      </sc-for>
                    </div>
                  </div>
  
                  <div style="display:flex;flex-direction:column;gap:15px">
                    <div style="padding:0 22px;display:flex;align-items:center;justify-content:space-between">
                      <div style="font-size:19px;font-weight:800;letter-spacing:-.028em;color:var(--ink)">{{ t.restaurants }}</div>
                    </div>
                    <div style="padding:0 22px;display:flex;flex-direction:column;gap:18px">
                      <sc-for list="{{ restaurants }}" as="r" hint-placeholder-count="2">
                        <div onClick="{{ r.go }}" style="border-radius:20px;overflow:hidden;background:var(--surface);border:1px solid var(--line);box-shadow:var(--shadow);cursor:pointer">
                          <div style="position:relative;height:186px;background:var(--imgbg)">
                            <image-slot id="{{ r.slot }}" shape="rect" placeholder="{{ r.ph }}"></image-slot>
                            <div onClick="{{ r.fav }}" role="button" tabIndex="0" aria-label="Toggle saved" style="position:absolute;top:12px;right:12px;width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,.92);display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.14)">
                              <svg width="19" height="19" viewBox="0 0 24 24" fill="{{ r.heart }}" stroke="#1B1411" stroke-width="1.7" stroke-linejoin="round"><path d="M12 20.5s-7.5-4.7-7.5-9.7a4.3 4.3 0 0 1 7.5-2.8 4.3 4.3 0 0 1 7.5 2.8c0 5-7.5 9.7-7.5 9.7Z"/></svg>
                            </div>
                          </div>
                          <div style="padding:16px 17px 17px;display:flex;flex-direction:column;gap:12px">
                            <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px">
                              <div style="min-width:0">
                                <div style="font-size:17px;font-weight:800;letter-spacing:-.028em;color:var(--ink);line-height:1.25">{{ r.name }}</div>
                                <div style="margin-top:6px;font-size:13px;color:var(--ink2)">{{ r.cat }} · {{ r.dist }}</div>
                              </div>
                              <div style="flex:0 0 auto;display:flex;align-items:center;gap:5px">
                                <svg width="14" height="14" viewBox="0 0 24 24" style="color:var(--gold)" fill="currentColor"><path d="M3 6.8h18l-1.5 6.9A8.4 8.4 0 0 1 12 20.5a8.4 8.4 0 0 1-7.5-6.8L3 6.8Z"/><rect x="7.4" y="21.3" width="9.2" height="2" rx="1"/></svg>
                                <span style="font-size:14px;font-weight:800;color:var(--ink)">{{ r.rating }}</span>
                              </div>
                            </div>
                            <div style="display:flex;align-items:center;justify-content:space-between;gap:12px">
                              <div style="font-size:14.5px;font-weight:700;color:var(--ink)">{{ r.price }} <span style="font-size:12.5px;font-weight:500;color:var(--ink3)">{{ t.avg }}</span></div>
                              <div onClick="{{ r.go }}" style="padding:11px 18px;border-radius:14px;background:var(--brandSoft);font-size:13.5px;font-weight:700;color:var(--brand);cursor:pointer">{{ t.viewDetails }}</div>
                            </div>
                          </div>
                        </div>
                      </sc-for>
                    </div>
                  </div>
                </div>
              </sc-if>
  
              <sc-if value="{{ isSearch }}">
                <div data-screen-label="Search" style="padding:8px 0 32px;display:flex;flex-direction:column;gap:22px">
                  <div style="padding:0 22px;display:flex;align-items:center;gap:12px">
                    <div onClick="{{ back }}" role="button" tabIndex="0" aria-label="Go back" style="width:42px;height:42px;flex:0 0 42px;border-radius:14px;background:var(--surface);border:1px solid var(--line);display:flex;align-items:center;justify-content:center;cursor:pointer">
                      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color:var(--ink)"><path d="M15 5l-7 7 7 7" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </div>
                    <div style="flex:1;display:flex;align-items:center;gap:11px;height:50px;padding:0 17px;border-radius:16px;background:var(--surface);border:1px solid var(--line);box-shadow:var(--shadow)">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color:var(--ink2);flex:0 0 18px"><circle cx="11" cy="11" r="7" stroke-width="2"/><path d="M16.5 16.5 21 21" stroke-width="2" stroke-linecap="round"/></svg>
                      <input value="{{ searchQuery }}" onChange="{{ setSearch }}" placeholder="Search places, food, trails…" aria-label="Search places" style="flex:1;min-width:0;background:transparent;border:none;outline:none;font-family:'Plus Jakarta Sans',system-ui,sans-serif;font-size:14.5px;font-weight:600;color:var(--ink);padding:0" />
                      <sc-if value="{{ hasQuery }}">
                        <div onClick="{{ clearSearch }}" role="button" tabIndex="0" aria-label="Clear search" style="width:24px;height:24px;flex:0 0 24px;border-radius:50%;background:var(--surface2);display:flex;align-items:center;justify-content:center;cursor:pointer">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color:var(--ink2)"><path d="M6 6l12 12M18 6L6 18" stroke-width="2.6" stroke-linecap="round"/></svg>
                        </div>
                      </sc-if>
                    </div>
                  </div>
  
                  <div class="nomScroll" style="display:flex;gap:8px;overflow-x:auto;padding:0 22px 2px">
                    <sc-for list="{{ filters }}" as="fl" hint-placeholder-count="4">
                      <div onClick="{{ fl.go }}" style="{{ fl.css }}">{{ fl.name }}</div>
                    </sc-for>
                  </div>
  
                  <div style="padding:0 22px;font-size:13px;font-weight:600;color:var(--ink3)">{{ resultCount }}</div>
  
                  <div style="padding:0 22px;display:flex;flex-direction:column;gap:18px">
                    <sc-for list="{{ results }}" as="r" hint-placeholder-count="4">
                      <div onClick="{{ r.go }}" style="border-radius:20px;overflow:hidden;background:var(--surface);border:1px solid var(--line);box-shadow:var(--shadow);cursor:pointer">
                        <div style="position:relative;height:186px;background:var(--imgbg)">
                          <image-slot id="{{ r.slot }}" shape="rect" placeholder="{{ r.ph }}"></image-slot>
                          <div onClick="{{ r.fav }}" role="button" tabIndex="0" aria-label="Toggle saved" style="position:absolute;top:12px;right:12px;width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,.92);display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.14)">
                            <svg width="19" height="19" viewBox="0 0 24 24" fill="{{ r.heart }}" stroke="#1B1411" stroke-width="1.7" stroke-linejoin="round"><path d="M12 20.5s-7.5-4.7-7.5-9.7a4.3 4.3 0 0 1 7.5-2.8 4.3 4.3 0 0 1 7.5 2.8c0 5-7.5 9.7-7.5 9.7Z"/></svg>
                          </div>
                        </div>
                        <div style="padding:16px 17px 17px;display:flex;flex-direction:column;gap:12px">
                          <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px">
                            <div style="min-width:0">
                              <div style="font-size:17px;font-weight:800;letter-spacing:-.028em;color:var(--ink);line-height:1.25">{{ r.name }}</div>
                              <div style="margin-top:6px;font-size:13px;color:var(--ink2)">{{ r.cat }} · {{ r.dist }}</div>
                            </div>
                            <div style="flex:0 0 auto;display:flex;align-items:center;gap:5px">
                              <svg width="14" height="14" viewBox="0 0 24 24" style="color:var(--gold)" fill="currentColor"><path d="M3 6.8h18l-1.5 6.9A8.4 8.4 0 0 1 12 20.5a8.4 8.4 0 0 1-7.5-6.8L3 6.8Z"/><rect x="7.4" y="21.3" width="9.2" height="2" rx="1"/></svg>
                              <span style="font-size:14px;font-weight:800;color:var(--ink)">{{ r.rating }}</span>
                            </div>
                          </div>
                          <div style="display:flex;align-items:center;justify-content:space-between;gap:12px">
                            <div style="font-size:14.5px;font-weight:700;color:var(--ink)">{{ r.price }} <span style="font-size:12.5px;font-weight:500;color:var(--ink3)">{{ t.avg }}</span></div>
                            <div onClick="{{ r.go }}" style="padding:11px 18px;border-radius:14px;background:var(--brandSoft);font-size:13.5px;font-weight:700;color:var(--brand);cursor:pointer">{{ t.viewDetails }}</div>
                          </div>
                        </div>
                      </div>
                    </sc-for>
                  </div>
  
                  <sc-if value="{{ noResults }}">
                    <div style="padding:34px 34px 40px;display:flex;flex-direction:column;align-items:center;gap:14px;text-align:center">
                      <div style="width:64px;height:64px;border-radius:50%;background:var(--surface2);display:flex;align-items:center;justify-content:center">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color:var(--ink3)"><circle cx="11" cy="11" r="7" stroke-width="1.9"/><path d="M16.5 16.5 21 21" stroke-width="1.9" stroke-linecap="round"/></svg>
                      </div>
                      <div>
                        <div style="font-size:17px;font-weight:800;letter-spacing:-.026em;color:var(--ink)">{{ t.noPlaces }}</div>
                        <div style="margin-top:7px;font-size:13.5px;line-height:1.55;color:var(--ink2);text-wrap:pretty">{{ emptyHint }}</div>
                      </div>
                      <div onClick="{{ resetSearch }}" role="button" tabIndex="0" style="margin-top:4px;padding:12px 20px;border-radius:14px;background:var(--brandSoft);font-size:13.5px;font-weight:700;color:var(--brand);cursor:pointer">{{ t.clearFilters }}</div>
                    </div>
                  </sc-if>
                </div>
              </sc-if>
  
              <sc-if value="{{ isSaved }}">
                <div data-screen-label="Saved places" style="padding:8px 0 32px;display:flex;flex-direction:column;gap:20px">
                  <div style="padding:0 22px;display:flex;align-items:center;gap:12px">
                    <div onClick="{{ back }}" role="button" tabIndex="0" aria-label="Go back" style="width:42px;height:42px;flex:0 0 42px;border-radius:14px;background:var(--surface);border:1px solid var(--line);display:flex;align-items:center;justify-content:center;cursor:pointer">
                      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color:var(--ink)"><path d="M15 5l-7 7 7 7" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </div>
                    <div style="flex:1">
                      <div style="font-size:23px;font-weight:800;letter-spacing:-.035em;color:var(--ink)">{{ t.savedPlaces }}</div>
                      <div style="margin-top:3px;font-size:12.5px;color:var(--ink3)">{{ savedCountLabel }}</div>
                    </div>
                  </div>
  
                  <sc-if value="{{ hasSaved }}">
                    <div style="padding:0 22px;display:flex;flex-direction:column;gap:18px">
                      <sc-for list="{{ savedList }}" as="r" hint-placeholder-count="2">
                        <div onClick="{{ r.go }}" style="border-radius:20px;overflow:hidden;background:var(--surface);border:1px solid var(--line);box-shadow:var(--shadow);cursor:pointer">
                          <div style="position:relative;height:186px;background:var(--imgbg)">
                            <image-slot id="{{ r.slot }}" shape="rect" placeholder="{{ r.ph }}"></image-slot>
                            <div onClick="{{ r.fav }}" role="button" tabIndex="0" aria-label="Remove from saved" style="position:absolute;top:12px;right:12px;width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,.92);display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.14)">
                              <svg width="19" height="19" viewBox="0 0 24 24" fill="{{ r.heart }}" stroke="#1B1411" stroke-width="1.7" stroke-linejoin="round"><path d="M12 20.5s-7.5-4.7-7.5-9.7a4.3 4.3 0 0 1 7.5-2.8 4.3 4.3 0 0 1 7.5 2.8c0 5-7.5 9.7-7.5 9.7Z"/></svg>
                            </div>
                          </div>
                          <div style="padding:16px 17px 17px;display:flex;align-items:flex-start;justify-content:space-between;gap:12px">
                            <div style="min-width:0">
                              <div style="font-size:17px;font-weight:800;letter-spacing:-.028em;color:var(--ink);line-height:1.25">{{ r.name }}</div>
                              <div style="margin-top:6px;font-size:13px;color:var(--ink2)">{{ r.cat }} · {{ r.dist }} · {{ r.price }}</div>
                            </div>
                            <div style="flex:0 0 auto;display:flex;align-items:center;gap:5px">
                              <svg width="14" height="14" viewBox="0 0 24 24" style="color:var(--gold)" fill="currentColor"><path d="M3 6.8h18l-1.5 6.9A8.4 8.4 0 0 1 12 20.5a8.4 8.4 0 0 1-7.5-6.8L3 6.8Z"/><rect x="7.4" y="21.3" width="9.2" height="2" rx="1"/></svg>
                              <span style="font-size:14px;font-weight:800;color:var(--ink)">{{ r.rating }}</span>
                            </div>
                          </div>
                        </div>
                      </sc-for>
                    </div>
                  </sc-if>
  
                  <sc-if value="{{ noSaved }}">
                    <div style="padding:30px 34px 40px;display:flex;flex-direction:column;align-items:center;gap:14px;text-align:center">
                      <div style="width:64px;height:64px;border-radius:50%;background:var(--brandSoft);display:flex;align-items:center;justify-content:center">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color:var(--brand)"><path d="M12 20.5s-7.5-4.7-7.5-9.7a4.3 4.3 0 0 1 7.5-2.8 4.3 4.3 0 0 1 7.5 2.8c0 5-7.5 9.7-7.5 9.7Z" stroke-width="1.8" stroke-linejoin="round"/></svg>
                      </div>
                      <div>
                        <div style="font-size:17px;font-weight:800;letter-spacing:-.026em;color:var(--ink)">{{ t.nothingSaved }}</div>
                        <div style="margin-top:7px;font-size:13.5px;line-height:1.55;color:var(--ink2);text-wrap:pretty">{{ t.nothingSavedSub }}</div>
                      </div>
                      <div onClick="{{ goExplore }}" role="button" tabIndex="0" style="margin-top:4px;padding:12px 20px;border-radius:14px;background:var(--brandSoft);font-size:13.5px;font-weight:700;color:var(--brand);cursor:pointer">{{ t.explorePlaces }}</div>
                    </div>
                  </sc-if>
                </div>
              </sc-if>
  
              <sc-if value="{{ isPlace }}">
                <div data-screen-label="Place" style="display:flex;flex-direction:column;min-height:100%">
                  <div style="position:relative;height:300px;flex:0 0 300px;background:var(--imgbg)">
                    <!-- rep-offset lifts the "representative" badge clear of
                         the content sheet that laps over this image. -->
                    <image-slot id="{{ pSlot }}" shape="rect" placeholder="{{ pPh }}" rep-offset="38"></image-slot>
                    <div style="position:absolute;top:14px;left:20px;right:20px;display:flex;justify-content:space-between">
                      <div onClick="{{ back }}" role="button" tabIndex="0" aria-label="Go back" style="width:42px;height:42px;border-radius:50%;background:rgba(255,255,255,.94);display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,.16)">
                        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#1B1411"><path d="M15 5l-7 7 7 7" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                      </div>
                      <div onClick="{{ pFav }}" role="button" tabIndex="0" aria-label="{{ pFavLabel }}" style="width:42px;height:42px;border-radius:50%;background:rgba(255,255,255,.94);display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,.16)">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="{{ pHeart }}" stroke="#1B1411" stroke-width="1.7" stroke-linejoin="round"><path d="M12 20.5s-7.5-4.7-7.5-9.7a4.3 4.3 0 0 1 7.5-2.8 4.3 4.3 0 0 1 7.5 2.8c0 5-7.5 9.7-7.5 9.7Z"/></svg>
                      </div>
                    </div>
                  </div>
  
                  <div style="flex:1;margin-top:-26px;position:relative;border-radius:26px 26px 0 0;background:var(--bg);padding:26px 22px 22px;display:flex;flex-direction:column;gap:24px">
                    <div>
                      <div style="display:flex;align-items:center;gap:9px;margin-bottom:10px">
                        <!-- Same colour the pin uses on the map, so the two
                             read as the same thing. -->
                        <div style="{{ pCatCss }}"><span style="{{ pCatDot }}"></span>{{ pCat }}</div>
                        <div style="display:flex;align-items:center;gap:5px">
                          <svg width="14" height="14" viewBox="0 0 24 24" style="color:var(--gold)" fill="currentColor"><path d="M3 6.8h18l-1.5 6.9A8.4 8.4 0 0 1 12 20.5a8.4 8.4 0 0 1-7.5-6.8L3 6.8Z"/><rect x="7.4" y="21.3" width="9.2" height="2" rx="1"/></svg>
                          <span style="font-size:13.5px;font-weight:800;color:var(--ink)">{{ pRating }}</span>
                          <span style="font-size:12.5px;color:var(--ink3)">({{ pReviews }})</span>
                        </div>
                      </div>
                      <div style="font-size:28px;font-weight:800;letter-spacing:-.036em;line-height:1.13;color:var(--ink);text-wrap:pretty">{{ pName }}</div>
                      <div style="margin-top:10px;display:flex;align-items:center;gap:8px;font-size:13.5px;color:var(--ink2)">
                        <span>{{ pDist }}</span><span>·</span>
                        <span style="font-weight:700;color:var(--green)">{{ t.openNow }} · {{ pHours }}</span>
                      </div>
                    </div>
  
                    <div style="display:flex;gap:10px">
                      <div style="flex:1;padding:15px;border-radius:17px;background:var(--surface);border:1px solid var(--line)">
                        <div style="font-size:11.5px;font-weight:700;letter-spacing:.06em;color:var(--ink3)">{{ t.avgPrice }}</div>
                        <div style="margin-top:6px;font-size:16px;font-weight:800;letter-spacing:-.024em;color:var(--ink)">{{ pPrice }}</div>
                      </div>
                      <div style="flex:1;padding:15px;border-radius:17px;background:var(--surface);border:1px solid var(--line)">
                        <div style="font-size:11.5px;font-weight:700;letter-spacing:.06em;color:var(--ink3)">{{ t.gettingThere }}</div>
                        <div style="margin-top:6px;font-size:16px;font-weight:800;letter-spacing:-.024em;color:var(--ink)">{{ pTravel }}</div>
                      </div>
                    </div>
  
                    <!-- Said outright, not just badged on the photo: no
                         free-licensed photograph of most of these venues
                         exists, and a picture of the right kind of food is
                         not a picture of the place. -->
                    <sc-if value="{{ pPhotoIsRep }}">
                      <div style="display:flex;gap:11px;align-items:flex-start;padding:13px 15px;border-radius:15px;background:var(--surface2)">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color:var(--ink3);flex:0 0 16px;margin-top:1px"><circle cx="12" cy="12" r="9" stroke-width="1.8"/><path d="M12 11v6M12 7.6v.4" stroke-width="2" stroke-linecap="round"/></svg>
                        <div style="flex:1;font-size:12.5px;line-height:1.5;color:var(--ink2);text-wrap:pretty">{{ t.repPhotoNote }}</div>
                      </div>
                    </sc-if>

                    <div style="font-size:15px;line-height:1.62;color:var(--ink2);text-wrap:pretty">{{ pDesc }}</div>

                    <div style="display:flex;flex-direction:column;gap:12px">
                      <div style="font-size:16px;font-weight:800;letter-spacing:-.024em;color:var(--ink)">{{ pListTitle }}</div>
                      <div style="display:flex;flex-wrap:wrap;gap:8px">
                        <sc-for list="{{ pDishes }}" as="d" hint-placeholder-count="4">
                          <div style="padding:10px 15px;border-radius:99px;background:var(--surface);border:1px solid var(--line);font-size:13.5px;font-weight:600;color:var(--ink)">{{ d }}</div>
                        </sc-for>
                      </div>
                    </div>
  
                    <div style="display:flex;flex-direction:column;gap:12px">
                      <div style="font-size:16px;font-weight:800;letter-spacing:-.024em;color:var(--ink)">{{ t.location }}</div>
                      <div onClick="{{ goMap }}" style="border-radius:18px;overflow:hidden;background:var(--surface);border:1px solid var(--line);cursor:pointer">
                        <div style="position:relative;height:130px;background:var(--surface2)">
                          <div style="position:absolute;inset:0;background:repeating-linear-gradient(90deg,var(--line) 0 1px,transparent 1px 46px),repeating-linear-gradient(0deg,var(--line) 0 1px,transparent 1px 44px)"></div>
                          <div style="position:absolute;left:0;right:0;top:52px;height:12px;background:var(--line)"></div>
                          <div style="position:absolute;top:0;bottom:0;left:130px;width:10px;background:var(--line)"></div>
                          <div style="position:absolute;left:50%;top:50%;margin:-30px 0 0 -14px;width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:var(--brand);box-shadow:0 4px 12px rgba(27,20,17,.24)"></div>
                        </div>
                        <div style="padding:14px 16px;display:flex;align-items:center;gap:12px">
                          <div style="flex:1;font-size:13.5px;font-weight:600;line-height:1.45;color:var(--ink);text-wrap:pretty">{{ pAddr }}</div>
                          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color:var(--ink3);flex:0 0 17px"><path d="M9 5l7 7-7 7" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        </div>
                      </div>
                    </div>

                    <!-- Chains: the bot listed every branch inside one address
                         field, which rendered as an unreadable run-on line and
                         put a single pin on the map. -->
                    <sc-if value="{{ pHasBranches }}">
                      <div style="display:flex;flex-direction:column;gap:11px">
                        <div style="display:flex;align-items:baseline;justify-content:space-between;gap:10px">
                          <div style="font-size:16px;font-weight:800;letter-spacing:-.024em;color:var(--ink)">{{ t.otherBranches }}</div>
                          <div style="font-size:12.5px;color:var(--ink3)">{{ pBranchCount }}</div>
                        </div>
                        <sc-if value="{{ pBranchesLoading }}">
                          <div style="font-size:12px;color:var(--ink3)">{{ t.checkingBranches }}</div>
                        </sc-if>
                        <div style="display:flex;flex-direction:column;gap:8px">
                          <sc-for list="{{ pBranches }}" as="br" hint-placeholder-count="4">
                            <div onClick="{{ br.go }}" role="button" tabIndex="0" style="display:flex;align-items:center;gap:12px;padding:13px 15px;border-radius:15px;background:var(--surface);border:1px solid var(--line);cursor:pointer">
                              <span style="{{ br.dot }}"></span>
                              <div style="flex:1;min-width:0">
                                <div style="font-size:13.5px;font-weight:600;color:var(--ink)">{{ br.addr }}</div>
                                <sc-if value="{{ br.isApprox }}">
                                  <div style="margin-top:3px;font-size:11.5px;color:var(--ink3)">{{ t.approxPin }}</div>
                                </sc-if>
                              </div>
                              <div style="font-size:12.5px;font-weight:700;color:var(--brand);white-space:nowrap">{{ br.dist }}</div>
                            </div>
                          </sc-for>
                        </div>
                      </div>
                    </sc-if>
  
                    <div style="display:flex;flex-direction:column;gap:12px">
                      <div style="display:flex;align-items:baseline;justify-content:space-between">
                        <div style="font-size:16px;font-weight:800;letter-spacing:-.024em;color:var(--ink)">{{ t.reviews }}</div>
                        <div style="font-size:13px;font-weight:700;color:var(--ink3)">{{ pReviews }} {{ t.totalWord }}</div>
                      </div>
                      <sc-for list="{{ pReviewList }}" as="rv" hint-placeholder-count="2">
                        <div style="padding:17px;border-radius:18px;background:var(--surface);border:1px solid var(--line)">
                          <div style="display:flex;align-items:center;gap:11px">
                            <div style="width:38px;height:38px;flex:0 0 38px;border-radius:50%;background:var(--brandSoft);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;color:var(--brand)">{{ rv.initials }}</div>
                            <div style="flex:1;min-width:0">
                              <div style="display:flex;align-items:center;gap:7px">
                                <div style="font-size:14px;font-weight:700;color:var(--ink)">{{ rv.who }}</div>
                                <sc-if value="{{ rv.isMine }}">
                                  <div style="padding:3px 8px;border-radius:99px;background:var(--brandSoft);font-size:10px;font-weight:800;letter-spacing:.06em;color:var(--brand)">{{ t.you }}</div>
                                </sc-if>
                              </div>
                              <div style="margin-top:2px;font-size:12px;color:var(--ink3)">{{ rv.from }} · {{ rv.when }}</div>
                            </div>
                            <div style="display:flex;gap:2px;flex:0 0 auto">
                              <sc-for list="{{ rv.stars }}" as="s" hint-placeholder-count="5">
                                <sc-if value="{{ s.on }}">
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style="color:var(--gold)"><path d="M3 6.8h18l-1.5 6.9A8.4 8.4 0 0 1 12 20.5a8.4 8.4 0 0 1-7.5-6.8L3 6.8Z"/><rect x="7.4" y="21.3" width="9.2" height="2" rx="1"/></svg>
                                </sc-if>
                                <sc-if value="{{ s.off }}">
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style="color:var(--ink3);opacity:.3"><path d="M3 6.8h18l-1.5 6.9A8.4 8.4 0 0 1 12 20.5a8.4 8.4 0 0 1-7.5-6.8L3 6.8Z"/><rect x="7.4" y="21.3" width="9.2" height="2" rx="1"/></svg>
                                </sc-if>
                              </sc-for>
                            </div>
                          </div>
                          <div style="margin-top:12px;font-size:14px;line-height:1.6;color:var(--ink2);text-wrap:pretty">{{ rv.text }}</div>
                          <sc-if value="{{ rv.verified }}">
                            <div style="margin-top:11px;display:flex;align-items:center;gap:6px;font-size:11.5px;font-weight:700;color:var(--green)">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="flex:0 0 12px"><path d="M12 3.5 19.5 7v5.5c0 4.4-3.1 7.6-7.5 9-4.4-1.4-7.5-4.6-7.5-9V7L12 3.5Z" stroke-width="2.2" stroke-linejoin="round"/></svg>
                              {{ t.verifiedVisit }}
                            </div>
                          </sc-if>
                        </div>
                      </sc-for>
                      <div onClick="{{ goReview }}" style="display:flex;align-items:center;justify-content:center;gap:9px;height:52px;border-radius:17px;background:var(--surface);border:1px solid var(--line);cursor:pointer;box-shadow:var(--shadow)">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color:var(--brand);flex:0 0 18px"><path d="M4 20h4L20 8l-4-4L4 16v4Z" stroke-width="1.9" stroke-linejoin="round"/></svg>
                        <div style="font-size:14.5px;font-weight:700;color:var(--brand)">{{ t.writeReview }}</div>
                      </div>
                    </div>
                  </div>
  
                  <div style="position:sticky;bottom:0;padding:14px 22px 20px;background:var(--bg);border-top:1px solid var(--line)">
                    <div onClick="{{ goMap }}" style="height:56px;border-radius:18px;background:var(--brand);display:flex;align-items:center;justify-content:center;gap:10px;cursor:pointer;box-shadow:var(--shadowLg)">
                      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color:var(--brandInk);flex:0 0 19px"><path d="M12 2 22 22 12 17.5 2 22 12 2Z" stroke-width="2" stroke-linejoin="round"/></svg>
                      <div style="font-size:16px;font-weight:700;color:var(--brandInk)">{{ t.getDirections }}</div>
                    </div>
                  </div>
                </div>
              </sc-if>
  
              <sc-if value="{{ isMap }}">
                <div data-screen-label="Map" style="position:relative;min-height:100%;display:flex;flex-direction:column">
                  <!-- A real OpenStreetMap. data-keep stops the renderer from
                       morphing away the tiles and markers Leaflet puts here;
                       nomad-engine.js owns everything inside it.

                       z-index:0 is load-bearing. Leaflet gives its own panes
                       z-indexes from 200 (tiles) to 1000 (controls). Without
                       an index of its own this container creates no stacking
                       context, so those panes competed with the screen's own
                       controls in the same context and won on every count —
                       the search bar, the filter chips, the zoom buttons and
                       the place card were all painted behind the map. Any
                       integer here confines them to this element. -->
                  <div data-ref="mapLayer" data-keep style="position:absolute;inset:0;z-index:0;background:var(--surface2)"></div>
  
                  <div style="position:relative;padding:12px 20px 0;display:flex;flex-direction:column;gap:12px">
                    <div style="display:flex;gap:10px">
                      <div onClick="{{ back }}" role="button" tabIndex="0" aria-label="Go back" style="width:46px;height:46px;flex:0 0 46px;border-radius:15px;background:var(--surface);display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:var(--shadow)">
                        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color:var(--ink)"><path d="M15 5l-7 7 7 7" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                      </div>
                      <div style="flex:1;display:flex;align-items:center;gap:11px;height:46px;padding:0 17px;border-radius:15px;background:var(--surface);box-shadow:var(--shadow)">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color:var(--ink2);flex:0 0 18px"><circle cx="11" cy="11" r="7" stroke-width="2"/><path d="M16.5 16.5 21 21" stroke-width="2" stroke-linecap="round"/></svg>
                        <div style="flex:1;font-size:14.5px;font-weight:500;color:var(--ink3)">{{ t.searchArea }}</div>
                      </div>
                    </div>
                    <div class="nomScroll" style="display:flex;gap:8px;overflow-x:auto;padding-bottom:2px">
                      <sc-for list="{{ mapFilters }}" as="m" hint-placeholder-count="4">
                        <div onClick="{{ m.go }}" style="{{ m.css }}">{{ m.name }}</div>
                      </sc-for>
                    </div>

                    <!-- What the pin colours mean. Only the categories the
                         current filter actually shows. -->
                    <div class="nomScroll" style="display:flex;gap:12px;overflow-x:auto;padding:1px 2px 3px">
                      <sc-for list="{{ mapLegend }}" as="lg" hint-placeholder-count="5">
                        <div style="flex:0 0 auto;display:flex;align-items:center;gap:6px;white-space:nowrap">
                          <span style="{{ lg.dot }}"></span>
                          <span style="font-size:11px;font-weight:700;color:var(--ink2);text-shadow:0 1px 3px var(--bg)">{{ lg.name }}</span>
                        </div>
                      </sc-for>
                    </div>
                    <sc-if value="{{ hasRouteNote }}">
                      <div style="padding:10px 14px;border-radius:14px;background:var(--surface);box-shadow:var(--shadow);font-size:13px;font-weight:700;color:var(--ink)">{{ routeNote }}</div>
                    </sc-if>

                    <!-- Without this there was no way back to location once a
                         first refusal had been remembered: every distance in
                         the app stayed measured from the middle of Bishkek and
                         nothing said so. -->
                    <sc-if value="{{ showLocateCta }}">
                      <div onClick="{{ locateMe }}" role="button" tabIndex="0" style="display:flex;align-items:center;gap:11px;padding:11px 14px;border-radius:14px;background:var(--surface);box-shadow:var(--shadow);cursor:pointer">
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color:var(--brand);flex:0 0 17px"><circle cx="12" cy="12" r="3.2" stroke-width="2"/><path d="M12 2.4v3.4M12 18.2v3.4M2.4 12h3.4M18.2 12h3.4" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="12" r="8" stroke-width="1.5" stroke-opacity=".4"/></svg>
                        <div style="flex:1;min-width:0">
                          <div style="font-size:13px;font-weight:700;color:var(--ink)">{{ locateTitle }}</div>
                          <div style="margin-top:2px;font-size:11.5px;line-height:1.4;color:var(--ink3);text-wrap:pretty">{{ locateSub }}</div>
                        </div>
                      </div>
                    </sc-if>
                  </div>
  
                  <div style="position:absolute;right:18px;top:184px;display:flex;flex-direction:column;gap:9px">
                    <div onClick="{{ mapRecenter }}" role="button" tabIndex="0" aria-label="Centre the map" style="width:44px;height:44px;border-radius:14px;background:var(--surface);display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:var(--shadow)">
                      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color:var(--brand)"><circle cx="12" cy="12" r="3.2" stroke-width="2"/><path d="M12 2.4v3.4M12 18.2v3.4M2.4 12h3.4M18.2 12h3.4" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="12" r="8" stroke-width="1.5" stroke-opacity=".4"/></svg>
                    </div>
                    <div onClick="{{ mapZoomIn }}" role="button" tabIndex="0" aria-label="Zoom in" style="width:44px;height:44px;border-radius:14px;background:var(--surface);display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:var(--shadow)">
                      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color:var(--ink2)"><path d="M12 6v12M6 12h12" stroke-width="2.2" stroke-linecap="round"/></svg>
                    </div>
                    <div onClick="{{ mapZoomOut }}" role="button" tabIndex="0" aria-label="Zoom out" style="width:44px;height:44px;border-radius:14px;background:var(--surface);display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:var(--shadow)">
                      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color:var(--ink2)"><path d="M6 12h12" stroke-width="2.2" stroke-linecap="round"/></svg>
                    </div>
                  </div>
  
  
                  <sc-if value="{{ noPins }}">
                    <div style="position:absolute;left:26px;right:26px;top:50%;margin-top:-52px;padding:20px;border-radius:20px;background:var(--surface);box-shadow:var(--shadowLg);text-align:center">
                      <div style="font-size:15.5px;font-weight:800;letter-spacing:-.024em;color:var(--ink)">{{ t.noPins }}</div>
                      <div style="margin-top:7px;font-size:13px;line-height:1.5;color:var(--ink2)">{{ t.noPinsSub }}</div>
                    </div>
                  </sc-if>
  
                  <!-- Tapping a pin reveals this card; nothing is shown until
                       one is tapped, so the card always refers to a place the
                       traveller actually chose. The patcher is positional and
                       unkeyed, so swapping places morphs the text in place and
                       the change goes unnoticed — syncMapCard() restarts this
                       animation by hand whenever the selection changes. -->
                  <sc-if value="{{ hasMapCard }}">
                    <div style="margin-top:auto;position:relative;padding:0 16px 18px">
                      <div data-ref="mapCardBox" style="border-radius:22px;overflow:hidden;background:var(--surface);box-shadow:var(--shadowLg);animation:nomCardUp .28s cubic-bezier(.34,1.28,.5,1) both">
                        <div onClick="{{ mapCardGo }}" style="cursor:pointer">
                          <div style="display:flex;justify-content:center;padding:10px 0 4px"><div style="width:40px;height:4px;border-radius:99px;background:var(--line)"></div></div>
                          <div style="padding:8px 16px 14px;display:flex;gap:14px">
                            <div style="width:88px;height:88px;flex:0 0 88px;border-radius:16px;overflow:hidden;background:var(--imgbg)">
                              <image-slot id="{{ mapCardSlot }}" shape="rect" placeholder="{{ mapCardPh }}"></image-slot>
                            </div>
                            <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:7px">
                              <div style="display:flex;align-items:flex-start;gap:8px">
                                <div style="flex:1;min-width:0;font-size:16px;font-weight:800;letter-spacing:-.026em;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ mapCardName }}</div>
                                <div onClick="{{ mapCardClose }}" role="button" tabIndex="0" aria-label="Close" style="width:26px;height:26px;flex:0 0 26px;margin:-2px -2px 0 0;border-radius:9px;background:var(--surface2);display:flex;align-items:center;justify-content:center;cursor:pointer">
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color:var(--ink2)"><path d="M6 6l12 12M18 6L6 18" stroke-width="2.4" stroke-linecap="round"/></svg>
                                </div>
                              </div>
                              <div style="display:flex;align-items:center;gap:6px;font-size:12.5px;color:var(--ink2);white-space:nowrap;overflow:hidden">
                                <svg width="12" height="12" viewBox="0 0 24 24" style="color:var(--gold);flex:0 0 12px" fill="currentColor"><path d="M3 6.8h18l-1.5 6.9A8.4 8.4 0 0 1 12 20.5a8.4 8.4 0 0 1-7.5-6.8L3 6.8Z"/><rect x="7.4" y="21.3" width="9.2" height="2" rx="1"/></svg>
                                <span style="font-weight:700;color:var(--ink)">{{ mapCardRating }}</span>
                                <span>·</span>
                                <span style="{{ mapCardDot }}"></span><span>{{ mapCardCat }}</span>
                                <sc-if value="{{ hasMapCardDist }}">
                                  <span>·</span><span style="font-weight:700;color:var(--brand)">{{ mapCardDist }}</span>
                                </sc-if>
                              </div>
                              <sc-if value="{{ mapCardHasBranches }}">
                                <div style="font-size:11.5px;font-weight:600;color:var(--ink3)">{{ mapCardBranches }}</div>
                              </sc-if>
                              <div style="font-size:13.5px;font-weight:700;color:var(--ink);margin-top:auto">{{ mapCardPrice }}</div>
                            </div>
                          </div>
                        </div>

                        <!-- Every branch, tappable: the map centres on the
                             one you pick. Outside the card's own onClick so
                             a branch does not also open the place screen. -->
                        <sc-if value="{{ mapCardHasBranches }}">
                          <div class="nomScroll" style="display:flex;gap:7px;overflow-x:auto;padding:0 16px 12px">
                            <sc-for list="{{ mapCardBranchList }}" as="mb" hint-placeholder-count="4">
                              <div onClick="{{ mb.go }}" role="button" tabIndex="0" style="{{ mb.css }}">
                                <span style="{{ mb.dot }}"></span>{{ mb.addr }}
                              </div>
                            </sc-for>
                          </div>
                        </sc-if>

                        <!-- The nearest stop and its route numbers. On the map
                             this is one line of context you can act on; it
                             used to be a whole section on the place screen,
                             which is not where you are when you are working
                             out how to get somewhere. -->
                        <sc-if value="{{ mapCardHasBus }}">
                          <div onClick="{{ mapCardBusGo }}" role="button" tabIndex="0" style="display:flex;align-items:center;gap:9px;margin:0 16px 14px;padding:10px 13px;border-radius:13px;background:var(--surface2);cursor:pointer">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color:var(--brand);flex:0 0 15px"><rect x="4" y="3.5" width="16" height="13" rx="3" stroke-width="1.8"/><path d="M4 11h16M7.5 20v-3.5M16.5 20v-3.5" stroke-width="1.8" stroke-linecap="round"/><circle cx="8" cy="13.8" r="1" fill="currentColor"/><circle cx="16" cy="13.8" r="1" fill="currentColor"/></svg>
                            <div style="flex:1;min-width:0">
                              <div style="font-size:12px;font-weight:700;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ mapCardBusStop }}</div>
                              <div style="margin-top:2px;font-size:11.5px;font-weight:600;color:var(--ink2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ mapCardBusRoutes }}</div>
                            </div>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color:var(--ink3);flex:0 0 14px"><path d="M9 5l7 7-7 7" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                          </div>
                        </sc-if>

                        <div style="display:flex;gap:9px;padding:0 16px 16px">
                          <div onClick="{{ mapCardGo }}" role="button" tabIndex="0" style="flex:1;height:42px;border-radius:13px;background:var(--brandSoft);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:var(--brand);cursor:pointer">{{ t.viewDetails }}</div>
                          <div onClick="{{ mapCardRoute }}" role="button" tabIndex="0" style="flex:1;height:42px;border-radius:13px;background:var(--brand);display:flex;align-items:center;justify-content:center;gap:7px;font-size:13px;font-weight:700;color:var(--brandInk);cursor:pointer">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="flex:0 0 15px"><path d="M12 2 22 22 12 17.5 2 22 12 2Z" stroke-width="2" stroke-linejoin="round"/></svg>
                            {{ t.getDirections }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </sc-if>

                  <!-- Nothing selected: say what to do rather than leaving the
                       bottom of the map blank. -->
                  <sc-if value="{{ showMapHint }}">
                    <div style="margin-top:auto;position:relative;padding:0 16px 18px">
                      <div style="padding:13px 16px;border-radius:16px;background:var(--surface);box-shadow:var(--shadow);display:flex;align-items:center;gap:11px;animation:nomFade .3s ease both">
                        <div style="width:15px;height:15px;flex:0 0 15px;border-radius:50%;background:#C9808D;border:2px solid #7E2C3B"></div>
                        <div style="flex:1;font-size:13px;font-weight:600;color:var(--ink2)">{{ mapHint }}</div>
                      </div>
                    </div>
                  </sc-if>
                </div>
              </sc-if>
  
              <sc-if value="{{ isAi }}">
                <div data-screen-label="AI Assistant" style="min-height:100%;display:flex;flex-direction:column">
  
                  <sc-if value="{{ isEmpty }}">
                    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:30px;padding:20px 22px 8px">
                      <div style="display:flex;flex-direction:column;gap:16px">
                        <div style="width:52px;height:52px;border-radius:17px;background:var(--brand);display:flex;align-items:center;justify-content:center">
                          <svg width="27" height="27" viewBox="0 0 24 24" fill="none" style="color:var(--brandInk)"><path d="M12 3.2l2 5.4 5.4 2-5.4 2-2 5.4-2-5.4-5.4-2 5.4-2 2-5.4Z" fill="currentColor"/><path d="M18.6 15.4l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z" fill="currentColor"/></svg>
                        </div>
                        <div>
                          <div style="font-size:30px;font-weight:800;letter-spacing:-.038em;line-height:1.12;color:var(--ink);text-wrap:pretty">{{ aiGreeting }}</div>
                          <div style="margin-top:11px;font-size:15px;line-height:1.55;color:var(--ink2);text-wrap:pretty">{{ t.aiSub }}</div>
                        </div>
                      </div>
  
                      <div style="display:flex;flex-direction:column;gap:10px">
                        <sc-for list="{{ promptCards }}" as="p" hint-placeholder-count="4">
                          <div onClick="{{ p.go }}" style="display:flex;align-items:center;gap:14px;padding:17px;border-radius:18px;background:var(--surface);border:1px solid var(--line);cursor:pointer;box-shadow:var(--shadow)">
                            <div style="flex:1;min-width:0">
                              <div style="font-size:15px;font-weight:700;letter-spacing:-.018em;color:var(--ink)">{{ p.q }}</div>
                              <div style="margin-top:4px;font-size:12.5px;color:var(--ink3)">{{ p.s }}</div>
                            </div>
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color:var(--ink3);flex:0 0 17px"><path d="M7 17 17 7m0 0H9m8 0v8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                          </div>
                        </sc-for>
                      </div>
                    </div>
                  </sc-if>
  
                  <sc-if value="{{ hasChat }}">
                    <div style="flex:1;padding:8px 22px 10px;display:flex;flex-direction:column;gap:22px">
                      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px">
                        <div style="font-size:15px;font-weight:800;letter-spacing:-.022em;color:var(--ink)">{{ t.aiTitle }}</div>
                        <div onClick="{{ resetChat }}" style="padding:8px 14px;border-radius:99px;background:var(--surface);border:1px solid var(--line);font-size:12.5px;font-weight:700;color:var(--ink2);white-space:nowrap;cursor:pointer">{{ t.newChat }}</div>
                      </div>
  
                      <sc-for list="{{ chatMsgs }}" as="m" hint-placeholder-count="2">
                        <div style="display:flex;flex-direction:column;gap:14px;align-items:stretch">
                          <div style="{{ m.css }}">{{ m.text }}</div>
                          <sc-if value="{{ m.hasNote }}">
                            <div style="font-size:11.5px;font-weight:600;line-height:1.45;color:var(--ink3)">{{ m.note }}</div>
                          </sc-if>
                          <sc-if value="{{ m.hasChips }}">
                            <div style="display:flex;flex-wrap:wrap;gap:8px">
                              <sc-for list="{{ m.chips }}" as="c" hint-placeholder-count="2">
                                <div onClick="{{ c.go }}" style="display:flex;align-items:center;gap:7px;padding:10px 14px;border-radius:99px;background:var(--surface);border:1px solid var(--line);font-size:13px;font-weight:700;color:var(--brand);cursor:pointer;box-shadow:var(--shadow)">
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="flex:0 0 13px"><path d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Z" stroke-width="2.2" stroke-linejoin="round"/></svg>
                                  {{ c.name }}
                                </div>
                              </sc-for>
                            </div>
                          </sc-if>

                          <!-- ── Places the answer cited ──────────────────────────────
                               The photograph, rating and distance the place already
                               carries, plus a way onto the map. An answer about a
                               gorge now shows the gorge. -->
                          <sc-if value="{{ m.hasCards }}">
                            <div style="display:flex;flex-direction:column;gap:9px">
                              <sc-for list="{{ m.cards }}" as="c" hint-placeholder-count="2">
                                <div onClick="{{ c.go }}" role="button" tabIndex="0" style="display:flex;gap:11px;padding:9px;border-radius:17px;background:var(--surface);border:1px solid var(--line);box-shadow:var(--shadow);cursor:pointer">
                                  <div style="width:74px;height:74px;flex:0 0 74px;border-radius:12px;overflow:hidden;background:var(--imgbg)">
                                    <image-slot id="{{ c.slot }}" shape="rect" placeholder="{{ c.ph }}"></image-slot>
                                  </div>
                                  <div style="flex:1;min-width:0;display:flex;flex-direction:column;justify-content:center;gap:5px">
                                    <div style="font-size:14.5px;font-weight:800;letter-spacing:-.02em;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ c.name }}</div>
                                    <div style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--ink2);white-space:nowrap;overflow:hidden">
                                      <sc-if value="{{ c.hasRating }}">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style="color:var(--gold);flex:0 0 12px"><path d="M3 6.8h18l-1.5 6.9A8.4 8.4 0 0 1 12 20.5a8.4 8.4 0 0 1-7.5-6.8L3 6.8Z"/><rect x="7.4" y="21.3" width="9.2" height="2" rx="1"/></svg>
                                        <span style="font-weight:700;color:var(--ink)">{{ c.rating }}</span>
                                        <span>·</span>
                                      </sc-if>
                                      <span style="{{ c.dot }}"></span><span style="overflow:hidden;text-overflow:ellipsis">{{ c.cat }}</span>
                                      <sc-if value="{{ c.hasDist }}">
                                        <span>·</span><span style="font-weight:700;color:var(--brand)">{{ c.dist }}</span>
                                      </sc-if>
                                    </div>
                                  </div>
                                  <div onClick="{{ c.goMap }}" role="button" tabIndex="0" aria-label="Show on map" style="width:38px;flex:0 0 38px;align-self:center;height:38px;border-radius:12px;background:var(--brandSoft);display:flex;align-items:center;justify-content:center;cursor:pointer">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color:var(--brand)"><path d="M9 20 3 22V6l6-2 6 2 6-2v16l-6 2-6-2Z" stroke-width="1.9" stroke-linejoin="round"/><path d="M9 4v16M15 6v16" stroke-width="1.9"/></svg>
                                  </div>
                                </div>
                              </sc-for>
                            </div>
                          </sc-if>
                          <sc-if value="{{ m.hasItin }}">
                            <div onClick="{{ goItin }}" style="border-radius:20px;overflow:hidden;background:var(--surface);border:1px solid var(--line);box-shadow:var(--shadowLg);cursor:pointer">
                              <div style="position:relative;height:112px;background:var(--surface2)">
                                <sc-if value="{{ itinHasRoute }}">
                                  <div style="position:absolute;inset:0">{{ itinRouteMapSmall }}</div>
                                </sc-if>
                                <div style="position:absolute;right:14px;bottom:12px;padding:6px 11px;border-radius:99px;background:var(--surface);font-size:11px;font-weight:700;color:var(--ink2);box-shadow:var(--shadow)">{{ t.stops12 }}</div>
                              </div>
                              <div style="padding:16px 17px 17px">
                                <div style="font-size:11px;font-weight:800;letter-spacing:.12em;color:var(--brand)">{{ t.suggestedItin }}</div>
                                <div style="margin-top:8px;font-size:18px;font-weight:800;letter-spacing:-.03em;color:var(--ink)">{{ t.threeDays }}</div>
                                <div style="margin-top:12px;display:flex;gap:20px">
                                  <div>
                                    <div style="font-size:11px;font-weight:700;letter-spacing:.05em;color:var(--ink3)">{{ t.estCost }}</div>
                                    <div style="margin-top:4px;font-size:14px;font-weight:800;color:var(--ink)">10 250 {{ t.somWord }}</div>
                                  </div>
                                  <div>
                                    <div style="font-size:11px;font-weight:700;letter-spacing:.05em;color:var(--ink3)">{{ t.travelTime }}</div>
                                    <div style="margin-top:4px;font-size:14px;font-weight:800;color:var(--ink)">{{ t.total620 }}</div>
                                  </div>
                                </div>
                                <div style="margin-top:15px;height:46px;border-radius:14px;background:var(--brandSoft);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:var(--brand)">{{ t.viewFullItin }}</div>
                              </div>
                            </div>
                          </sc-if>
                        </div>
                      </sc-for>
  
                      <sc-if value="{{ typing }}">
                        <div role="status" aria-live="polite" aria-label="Assistant is typing" style="display:flex;gap:6px;align-items:center">
                          <div style="width:7px;height:7px;border-radius:50%;background:var(--ink3);animation:nomBlink 1.1s infinite"></div>
                          <div style="width:7px;height:7px;border-radius:50%;background:var(--ink3);animation:nomBlink 1.1s .18s infinite"></div>
                          <div style="width:7px;height:7px;border-radius:50%;background:var(--ink3);animation:nomBlink 1.1s .36s infinite"></div>
                        </div>
                      </sc-if>
                    </div>
                  </sc-if>
  
                  <div style="position:sticky;bottom:0;padding:12px 20px 18px;background:var(--bg)">
                    <div style="display:flex;align-items:center;gap:11px;min-height:58px;padding:9px 9px 9px 19px;border-radius:20px;background:var(--surface);border:1px solid var(--line);box-shadow:var(--shadowLg)">
                      <input value="{{ chatInput }}" onChange="{{ setChatInput }}" onKeyDown="{{ chatKeyDown }}" placeholder="Ask anything…" aria-label="Ask the assistant" style="flex:1;min-width:0;background:transparent;border:none;outline:none;font-family:'Plus Jakarta Sans',system-ui,sans-serif;font-size:15px;font-weight:500;color:var(--ink);padding:0" />
                      <div onClick="{{ sendChat }}" role="button" tabIndex="0" aria-label="Send message" style="{{ sendCss }}">
                        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 19V5m0 0-6 6m6-6 6 6" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
                      </div>
                    </div>
                  </div>
                </div>
              </sc-if>
  
              <sc-if value="{{ isItin }}">
                <div data-screen-label="Itinerary" style="padding:8px 0 32px;display:flex;flex-direction:column;gap:22px">
                  <div style="padding:0 22px;display:flex;align-items:flex-start;gap:12px">
                    <div onClick="{{ back }}" role="button" tabIndex="0" aria-label="Go back" style="width:42px;height:42px;flex:0 0 42px;border-radius:14px;background:var(--surface);border:1px solid var(--line);display:flex;align-items:center;justify-content:center;cursor:pointer">
                      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color:var(--ink)"><path d="M15 5l-7 7 7 7" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </div>
                    <div style="flex:1">
                      <div style="font-size:23px;font-weight:800;letter-spacing:-.035em;line-height:1.15;color:var(--ink)">{{ t.threeDays }}</div>
                      <div style="margin-top:5px;font-size:13px;color:var(--ink2)">{{ t.builtByAi }}</div>
                    </div>
                  </div>
  
                  <div style="padding:0 22px">
                    <div style="border-radius:20px;overflow:hidden;background:var(--surface);border:1px solid var(--line);box-shadow:var(--shadow)">
                      <!-- The real three-day route, drawn from the stops.
                           Tapping it puts the whole thing on the map. -->
                      <div onClick="{{ itinShowAll }}" role="button" tabIndex="0" aria-label="Show the whole trip on the map" style="position:relative;height:136px;background:var(--surface2);cursor:pointer">
                        <sc-if value="{{ itinHasRoute }}">
                          <div style="position:absolute;inset:0">{{ itinRouteMap }}</div>
                        </sc-if>
                        <div style="position:absolute;right:12px;bottom:12px;display:flex;align-items:center;gap:7px;padding:7px 12px;border-radius:99px;background:var(--surface);box-shadow:var(--shadow);font-size:11.5px;font-weight:700;color:var(--brand)">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="flex:0 0 13px"><path d="M9 20 3 22V6l6-2 6 2 6-2v16l-6 2-6-2Z" stroke-width="2" stroke-linejoin="round"/><path d="M9 4v16M15 6v16" stroke-width="2"/></svg>
                          {{ t.showOnMap }}
                        </div>
                      </div>
                      <div style="padding:16px 18px;display:flex;justify-content:space-between;gap:14px">
                        <div>
                          <div style="font-size:11px;font-weight:700;letter-spacing:.05em;color:var(--ink3)">{{ t.totalCost }}</div>
                          <div style="margin-top:5px;font-size:16px;font-weight:800;letter-spacing:-.024em;color:var(--ink)">10 250 {{ t.somWord }}</div>
                          <div style="margin-top:2px;font-size:12px;color:var(--ink3)">{{ t.about117 }}</div>
                        </div>
                        <div>
                          <div style="font-size:11px;font-weight:700;letter-spacing:.05em;color:var(--ink3)">{{ t.travelTime }}</div>
                          <div style="margin-top:5px;font-size:16px;font-weight:800;letter-spacing:-.024em;color:var(--ink)">{{ t.total620short }}</div>
                          <div style="margin-top:2px;font-size:12px;color:var(--ink3)">{{ t.over3days }}</div>
                        </div>
                        <div>
                          <div style="font-size:11px;font-weight:700;letter-spacing:.05em;color:var(--ink3)">{{ t.stopsCaps }}</div>
                          <div style="margin-top:5px;font-size:16px;font-weight:800;letter-spacing:-.024em;color:var(--ink)">12</div>
                          <div style="margin-top:2px;font-size:12px;color:var(--ink3)">{{ t.perDay4 }}</div>
                        </div>
                      </div>
                    </div>
                  </div>
  
                  <div style="padding:0 22px;display:flex;gap:9px">
                    <sc-for list="{{ itinDays }}" as="d" hint-placeholder-count="3">
                      <div onClick="{{ d.go }}" style="{{ d.css }}">{{ d.label }}</div>
                    </sc-for>
                  </div>
  
                  <div style="padding:0 22px;display:flex;align-items:center;justify-content:space-between;gap:12px">
                    <div style="min-width:0">
                      <div style="font-size:17px;font-weight:800;letter-spacing:-.026em;color:var(--ink)">{{ itinTheme }}</div>
                      <div style="margin-top:4px;font-size:12px;color:var(--ink3)">{{ itinWalk }} · {{ itinCost }}</div>
                    </div>
                    <!-- This day's stops, routed on the real map. -->
                    <sc-if value="{{ itinDayHasRoute }}">
                      <div onClick="{{ itinShowDay }}" role="button" tabIndex="0" style="flex:0 0 auto;display:flex;align-items:center;gap:7px;padding:9px 14px;border-radius:13px;background:var(--brandSoft);font-size:12.5px;font-weight:700;color:var(--brand);cursor:pointer">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="flex:0 0 14px"><path d="M9 20 3 22V6l6-2 6 2 6-2v16l-6 2-6-2Z" stroke-width="2" stroke-linejoin="round"/><path d="M9 4v16M15 6v16" stroke-width="2"/></svg>
                        {{ t.showOnMap }}
                      </div>
                    </sc-if>
                  </div>
  
                  <div style="padding:0 22px;display:flex;flex-direction:column;gap:14px">
                    <sc-for list="{{ itinStops }}" as="sp" hint-placeholder-count="4">
                      <div onClick="{{ sp.go }}" style="display:flex;flex-direction:column;gap:0;cursor:pointer">
                        <div style="display:flex;align-items:center;gap:10px;margin-bottom:9px">
                          <div style="padding:5px 11px;border-radius:99px;background:var(--brandSoft);font-size:12px;font-weight:800;color:var(--brand)">{{ sp.t }}</div>
                          <div style="font-size:12px;color:var(--ink3)">{{ sp.travel }}</div>
                        </div>
                        <div style="display:flex;gap:14px;padding:13px;border-radius:19px;background:var(--surface);border:1px solid var(--line);box-shadow:var(--shadow)">
                          <div style="width:82px;height:82px;flex:0 0 82px;border-radius:15px;overflow:hidden;background:var(--imgbg)">
                            <image-slot id="{{ sp.slot }}" shape="rect" placeholder="{{ sp.ph }}"></image-slot>
                          </div>
                          <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:6px">
                            <div style="font-size:15.5px;font-weight:800;letter-spacing:-.024em;line-height:1.25;color:var(--ink);text-wrap:pretty">{{ sp.n }}</div>
                            <div style="font-size:12.5px;color:var(--ink3)">{{ sp.cat }}</div>
                            <div style="margin-top:auto;font-size:13.5px;font-weight:700;color:var(--green)">{{ sp.cost }}</div>
                          </div>
                        </div>
                      </div>
                    </sc-for>
                  </div>
  
                  <div style="padding:0 22px">
                    <div onClick="{{ saveTrip }}" role="button" tabIndex="0" style="{{ saveTripCss }}">
                    <sc-if value="{{ tripIsSaved }}">
                      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="flex:0 0 19px"><path d="M5 12.5l4.5 4.5L19 7" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </sc-if>
                    {{ saveTripLabel }}
                  </div>
                  </div>
                </div>
              </sc-if>
  
              <sc-if value="{{ isRewards }}">
                <div data-screen-label="Rewards" style="padding:8px 22px 32px;display:flex;flex-direction:column;gap:26px">
                  <div style="display:flex;align-items:center;gap:12px">
                    <div onClick="{{ back }}" role="button" tabIndex="0" aria-label="Go back" style="width:42px;height:42px;flex:0 0 42px;border-radius:14px;background:var(--surface);border:1px solid var(--line);display:flex;align-items:center;justify-content:center;cursor:pointer">
                      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color:var(--ink)"><path d="M15 5l-7 7 7 7" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </div>
                    <div style="font-size:23px;font-weight:800;letter-spacing:-.035em;color:var(--ink)">{{ t.rewards }}</div>
                  </div>
  
                  <div style="padding:20px;border-radius:22px;background:var(--surface);border:1px solid var(--line);box-shadow:var(--shadow);display:flex;align-items:center;gap:16px">
                    <div style="position:relative;width:58px;height:58px;flex:0 0 58px">
                      <div style="{{ ringCss }}"></div>
                      <div style="position:absolute;inset:5px;border-radius:50%;background:var(--surface);display:flex;flex-direction:column;align-items:center;justify-content:center">
                        <div style="font-size:13px;font-weight:800;letter-spacing:-.03em;color:var(--ink)">{{ xpShort }}</div>
                        <div style="font-size:8px;font-weight:800;letter-spacing:.1em;color:var(--ink3)">XP</div>
                      </div>
                    </div>
                    <div style="flex:1;min-width:0">
                      <div style="font-size:17px;font-weight:800;letter-spacing:-.028em;color:var(--ink)">{{ levelLabel }}</div>
                      <div style="margin-top:8px;height:7px;border-radius:99px;background:var(--surface2);overflow:hidden"><div style="{{ levelBarCss }}"></div></div>
                      <div style="margin-top:8px;font-size:12.5px;color:var(--ink2)">{{ xpToNext }} {{ t.toWord }} <span style="font-weight:700;color:var(--ink)">{{ xpNextName }}</span> · {{ t.balanceWorth }} {{ xpWorth }}</div>
                    </div>
                  </div>
  
                  <div>
                    <div style="display:flex;align-items:baseline;justify-content:space-between;margin-bottom:14px">
                      <div style="font-size:19px;font-weight:800;letter-spacing:-.028em;color:var(--ink)">{{ t.badges }}</div>
                      <div style="font-size:12.5px;font-weight:700;color:var(--ink3)">{{ earnedLabel }}</div>
                    </div>
                    <div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr) minmax(0,1fr);gap:11px">
                      <sc-for list="{{ badges }}" as="b" hint-placeholder-count="6">
                        <div onClick="{{ b.go }}" style="{{ b.css }}">
                          <div style="position:relative;display:flex;align-items:center;justify-content:center">
                            {{ b.art }}
                            <sc-if value="{{ b.locked }}">
                              <div style="position:absolute;bottom:-2px;right:-2px;width:22px;height:22px;border-radius:50%;background:var(--surface);border:1px solid var(--line);display:flex;align-items:center;justify-content:center">
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color:var(--ink3)"><rect x="5" y="10.5" width="14" height="10" rx="2.2" stroke-width="2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" stroke-width="2" stroke-linecap="round"/></svg>
                              </div>
                            </sc-if>
                          </div>
                          <div style="{{ b.nameCss }}">{{ b.name }}</div>
                          <div style="{{ b.xpCss }}">{{ b.prog }} {{ t.verifiedLower }}</div>
                        </div>
                      </sc-for>
                    </div>
                  </div>
  
                  <div style="display:flex;gap:12px;padding:16px;border-radius:18px;background:var(--greenSoft);border:1px solid var(--line)">
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color:var(--green);flex:0 0 19px;margin-top:1px"><circle cx="12" cy="12" r="9" stroke-width="1.9"/><path d="M8.5 12.2l2.4 2.4 4.6-5" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    <div style="flex:1;font-size:13px;line-height:1.55;color:var(--ink2);text-wrap:pretty"><span style="font-weight:700;color:var(--ink)">{{ xpRate }}</span> {{ t.xpNote }}</div>
                  </div>
                </div>
              </sc-if>
  
              <sc-if value="{{ isChallenge }}">
                <div data-screen-label="Challenge" style="padding:8px 22px 32px;display:flex;flex-direction:column;gap:24px">
                  <div style="display:flex;align-items:center;gap:12px">
                    <div onClick="{{ back }}" role="button" tabIndex="0" aria-label="Go back" style="width:42px;height:42px;flex:0 0 42px;border-radius:14px;background:var(--surface);border:1px solid var(--line);display:flex;align-items:center;justify-content:center;cursor:pointer">
                      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color:var(--ink)"><path d="M15 5l-7 7 7 7" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </div>
                    <div style="font-size:13px;font-weight:700;letter-spacing:.05em;color:var(--ink3)">{{ t.challengeCaps }}</div>
                  </div>
  
                  <div style="display:flex;align-items:center;gap:16px">
                    <div style="flex:0 0 auto">{{ cArt }}</div>
                    <div style="flex:1;min-width:0">
                      <div style="font-size:23px;font-weight:800;letter-spacing:-.035em;line-height:1.15;color:var(--ink);text-wrap:pretty">{{ cName }}</div>
                      <div style="margin-top:7px;display:flex;align-items:baseline;gap:8px">
                        <span style="font-size:15px;font-weight:800;color:var(--ink)">{{ cXp }}</span>
                        <span style="font-size:13.5px;font-weight:700;color:var(--green)">{{ cSom }}</span>
                      </div>
                    </div>
                  </div>
  
                  <div>
                    <div style="display:flex;align-items:baseline;justify-content:space-between;margin-bottom:10px">
                      <div style="font-size:13.5px;font-weight:700;color:var(--ink)">{{ cProg }}</div>
                      <div style="font-size:12.5px;font-weight:700;color:var(--ink3)">{{ cPerTask }}</div>
                    </div>
                    <div style="height:9px;border-radius:99px;background:var(--surface2);overflow:hidden">
                      <div style="width:{{ cPct }};height:100%;border-radius:99px;background:var(--green);transition:width .4s"></div>
                    </div>
                  </div>
  
                  <div style="display:flex;gap:13px;padding:16px;border-radius:18px;background:var(--brandSoft)">
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color:var(--brand);flex:0 0 19px;margin-top:1px"><path d="M12 3.5 19.5 7v5.5c0 4.4-3.1 7.6-7.5 9-4.4-1.4-7.5-4.6-7.5-9V7L12 3.5Z" stroke-width="1.9" stroke-linejoin="round"/><path d="M9 12.2l2 2 4-4.2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    <div style="flex:1;font-size:13px;line-height:1.55;color:var(--ink2);text-wrap:pretty">{{ t.challengeNote }}</div>
                  </div>
  
                  <div style="display:flex;flex-direction:column;gap:11px">
                    <sc-for list="{{ cTasks }}" as="t" hint-placeholder-count="6">
                      <div style="{{ t.rowCss }}">
                        <div style="{{ t.nodeCss }}">
                          <sc-if value="{{ t.isOk }}">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M5 12.5l4.5 4.5L19 7" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>
                          </sc-if>
                          <sc-if value="{{ t.isTodo }}">{{ t.num }}</sc-if>
                        </div>
                        <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:5px">
                          <div style="{{ t.nameCss }}">{{ t.n }}</div>
                          <div style="font-size:12.5px;color:var(--ink3)">{{ t.at }}</div>
                          <sc-if value="{{ t.isOk }}">
                            <div style="margin-top:3px;display:flex;align-items:center;gap:6px;font-size:12px;font-weight:700;color:var(--green)">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="flex:0 0 12px"><path d="M12 3.5 19.5 7v5.5c0 4.4-3.1 7.6-7.5 9-4.4-1.4-7.5-4.6-7.5-9V7L12 3.5Z" stroke-width="2.2" stroke-linejoin="round"/></svg>
                              {{ t.verified }}
                            </div>
                          </sc-if>
                          <sc-if value="{{ t.isTodo }}">
                            <div style="margin-top:3px;font-size:12px;color:var(--ink3)">Needs: {{ t.need }}</div>
                          </sc-if>
                        </div>
                        <sc-if value="{{ t.isTodo }}">
                          <div onClick="{{ t.go }}" role="button" tabIndex="0" style="flex:0 0 auto;align-self:center;padding:11px 16px;border-radius:13px;background:var(--brand);font-size:13px;font-weight:700;color:var(--brandInk);cursor:pointer">{{ t.proveIt }}</div>
                        </sc-if>
                      </div>
                    </sc-for>
                  </div>
  
                  <sc-if value="{{ cNotEarned }}">
                    <div style="display:flex;align-items:center;gap:14px;padding:17px;border-radius:19px;background:var(--surface);border:1px dashed var(--line)">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color:var(--ink3);flex:0 0 22px"><rect x="5" y="10.5" width="14" height="10" rx="2.4" stroke-width="1.9"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" stroke-width="1.9" stroke-linecap="round"/></svg>
                      <div style="flex:1">
                        <div style="font-size:14.5px;font-weight:700;color:var(--ink)">{{ t.badgeLocked }}</div>
                        <div style="margin-top:3px;font-size:12.5px;color:var(--ink3)">{{ t.badgeLockedSub }}</div>
                      </div>
                    </div>
                  </sc-if>
                  <sc-if value="{{ cIsEarned }}">
                    <div style="display:flex;align-items:center;gap:14px;padding:17px;border-radius:19px;background:var(--greenSoft)">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color:var(--green);flex:0 0 22px"><circle cx="12" cy="12" r="9" stroke-width="1.9"/><path d="M8.5 12.2l2.4 2.4 4.6-5" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/></svg>
                      <div style="flex:1">
                        <div style="font-size:14.5px;font-weight:700;color:var(--ink)">{{ t.badgeEarned }}</div>
                        <div style="margin-top:3px;font-size:12.5px;color:var(--ink2)">{{ cXp }} credited · {{ cSom }} to spend</div>
                      </div>
                    </div>
                  </sc-if>
                </div>
              </sc-if>
  
              <sc-if value="{{ isVerify }}">
                <div data-screen-label="Verify" style="min-height:100%;display:flex;flex-direction:column">
                  <div style="padding:8px 22px 0;display:flex;align-items:center;gap:12px">
                    <div onClick="{{ back }}" role="button" tabIndex="0" aria-label="Go back" style="width:42px;height:42px;flex:0 0 42px;border-radius:14px;background:var(--surface);border:1px solid var(--line);display:flex;align-items:center;justify-content:center;cursor:pointer">
                      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color:var(--ink)"><path d="M6 6l12 12M18 6L6 18" stroke-width="2.1" stroke-linecap="round"/></svg>
                    </div>
                    <div style="flex:1;min-width:0">
                      <div style="font-size:12px;font-weight:700;letter-spacing:.05em;color:var(--ink3)">{{ t.proveThisTask }}</div>
                      <div style="margin-top:2px;font-size:15px;font-weight:800;letter-spacing:-.022em;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ vTaskName }}</div>
                    </div>
                    <div style="flex:0 0 auto;padding:7px 12px;border-radius:99px;background:var(--greenSoft);font-size:12.5px;font-weight:800;color:var(--green)">{{ vXp }}</div>
                  </div>
  
                  <sc-if value="{{ vIdle }}">
                    <div style="flex:1;padding:22px;display:flex;flex-direction:column;gap:20px">
                      <div style="position:relative;border-radius:22px;overflow:hidden;background:var(--surface2);height:270px;display:flex;align-items:center;justify-content:center">
                        <div style="position:absolute;inset:0;background:repeating-linear-gradient(90deg,var(--line) 0 1px,transparent 1px 40px),repeating-linear-gradient(0deg,var(--line) 0 1px,transparent 1px 40px);opacity:.6"></div>
                        <div style="position:relative;width:172px;height:172px">
                          <div style="position:absolute;top:0;left:0;width:44px;height:44px;border-top:4px solid var(--brand);border-left:4px solid var(--brand);border-radius:16px 0 0 0"></div>
                          <div style="position:absolute;top:0;right:0;width:44px;height:44px;border-top:4px solid var(--brand);border-right:4px solid var(--brand);border-radius:0 16px 0 0"></div>
                          <div style="position:absolute;bottom:0;left:0;width:44px;height:44px;border-bottom:4px solid var(--brand);border-left:4px solid var(--brand);border-radius:0 0 0 16px"></div>
                          <div style="position:absolute;bottom:0;right:0;width:44px;height:44px;border-bottom:4px solid var(--brand);border-right:4px solid var(--brand);border-radius:0 0 16px 0"></div>
                          <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:var(--ink3)">
                            <sc-if value="{{ vIsQr }}">
                              <svg width="62" height="62" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="7" height="7" rx="1.6" stroke-width="1.7"/><rect x="14" y="3" width="7" height="7" rx="1.6" stroke-width="1.7"/><rect x="3" y="14" width="7" height="7" rx="1.6" stroke-width="1.7"/><path d="M14 14h3v3h-3zM19 14h2M14 19h3M19 19h2" stroke-width="1.7" stroke-linecap="round"/></svg>
                            </sc-if>
                            <sc-if value="{{ vIsReceipt }}">
                              <svg width="62" height="62" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" stroke-width="1.7" stroke-linejoin="round"/><path d="M9 8h6M9 12h6" stroke-width="1.7" stroke-linecap="round"/></svg>
                            </sc-if>
                            <sc-if value="{{ vIsGps }}">
                              <svg width="62" height="62" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Z" stroke-width="1.7" stroke-linejoin="round"/><circle cx="12" cy="10" r="2.6" stroke-width="1.7"/></svg>
                            </sc-if>
                            <sc-if value="{{ vIsPhoto }}">
                              <svg width="62" height="62" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="2.5" y="6.5" width="19" height="13" rx="3" stroke-width="1.7"/><circle cx="12" cy="13" r="3.6" stroke-width="1.7"/><path d="M8.5 6.5l1.2-2.2h4.6l1.2 2.2" stroke-width="1.7" stroke-linejoin="round"/></svg>
                            </sc-if>
                            <sc-if value="{{ vIsTrace }}">
                              <svg width="62" height="62" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M5.5 19c4-.5 3-5.5 6.5-6s3.5-5 6.5-5.5" stroke-width="1.7" stroke-linecap="round" stroke-dasharray="2.6 2.8"/><circle cx="5.5" cy="19" r="2.2" stroke-width="1.7"/><path d="M18.5 3.5c1.9 0 3.4 1.5 3.4 3.4 0 2.4-3.4 6-3.4 6s-3.4-3.6-3.4-6c0-1.9 1.5-3.4 3.4-3.4Z" stroke-width="1.7" stroke-linejoin="round"/></svg>
                            </sc-if>
                          </div>
                        </div>
                      </div>
  
                      <div>
                        <div style="font-size:17px;font-weight:800;letter-spacing:-.026em;color:var(--ink)">{{ vPrimary }}</div>
                        <div style="margin-top:7px;font-size:13.5px;line-height:1.55;color:var(--ink2);text-wrap:pretty">{{ vPrimaryNote }}</div>
                        <div style="margin-top:9px;font-size:13px;color:var(--ink3)">{{ t.atWord }} {{ vTaskAt }}</div>
                        <sc-if value="{{ vSwitched }}">
                          <div style="margin-top:11px;display:flex;align-items:center;gap:8px;font-size:12.5px;font-weight:700;color:var(--green)">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="flex:0 0 14px"><path d="M5 12.5l4.5 4.5L19 7" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
                            {{ t.switched }}
                          </div>
                        </sc-if>
                      </div>
  
                      <div onClick="{{ submitProof }}" role="button" tabIndex="0" style="height:56px;border-radius:18px;background:var(--brand);display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:var(--brandInk);cursor:pointer;box-shadow:var(--shadowLg)">{{ vPrimary }}</div>
  
                      <div style="display:flex;flex-direction:column;gap:10px">
                        <div style="font-size:12.5px;font-weight:700;letter-spacing:.05em;color:var(--ink3)">{{ t.otherWay }}</div>
                        <sc-for list="{{ vAlts }}" as="alt" hint-placeholder-count="3">
                          <div onClick="{{ alt.go }}" role="button" tabIndex="0" style="display:flex;align-items:flex-start;gap:12px;padding:15px;border-radius:16px;background:var(--surface);border:1px solid var(--line);cursor:pointer">
                            <div style="flex:1;min-width:0">
                              <div style="font-size:14px;font-weight:600;color:var(--ink)">{{ alt.name }}</div>
                              <div style="margin-top:4px;font-size:12px;line-height:1.45;color:var(--ink3);text-wrap:pretty">{{ alt.note }}</div>
                            </div>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color:var(--ink3);flex:0 0 16px;margin-top:2px"><path d="M9 5l7 7-7 7" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                          </div>
                        </sc-for>
                      </div>
                    </div>
                  </sc-if>
  
                  <sc-if value="{{ vChecking }}">
                    <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px;padding:22px">
                      <div style="display:flex;gap:8px">
                        <div style="width:11px;height:11px;border-radius:50%;background:var(--brand);animation:nomBlink 1.1s infinite"></div>
                        <div style="width:11px;height:11px;border-radius:50%;background:var(--brand);animation:nomBlink 1.1s .18s infinite"></div>
                        <div style="width:11px;height:11px;border-radius:50%;background:var(--brand);animation:nomBlink 1.1s .36s infinite"></div>
                      </div>
                      <div style="text-align:center">
                        <div style="font-size:20px;font-weight:800;letter-spacing:-.03em;color:var(--ink)">{{ t.checkingProof }}</div>
                        <div style="margin-top:8px;font-size:13.5px;color:var(--ink2)">{{ t.underMinute }}</div>
                      </div>
                    </div>
                  </sc-if>
                </div>
              </sc-if>
  
              <sc-if value="{{ isReview }}">
                <div data-screen-label="Write review" style="min-height:100%;display:flex;flex-direction:column">
                  <div style="padding:8px 22px 0;display:flex;align-items:center;gap:12px">
                    <div onClick="{{ back }}" role="button" tabIndex="0" aria-label="Go back" style="width:42px;height:42px;flex:0 0 42px;border-radius:14px;background:var(--surface);border:1px solid var(--line);display:flex;align-items:center;justify-content:center;cursor:pointer">
                      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color:var(--ink)"><path d="M6 6l12 12M18 6L6 18" stroke-width="2.1" stroke-linecap="round"/></svg>
                    </div>
                    <div style="flex:1;min-width:0">
                      <div style="font-size:12px;font-weight:700;letter-spacing:.05em;color:var(--ink3)">{{ t.writeReviewCaps }}</div>
                      <div style="margin-top:2px;font-size:15px;font-weight:800;letter-spacing:-.022em;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ pName }}</div>
                    </div>
                  </div>
  
                  <div style="flex:1;padding:22px;display:flex;flex-direction:column;gap:24px">
                    <div style="padding:24px 18px;border-radius:22px;background:var(--surface);border:1px solid var(--line);box-shadow:var(--shadow);display:flex;flex-direction:column;align-items:center;gap:14px">
                      <div style="font-size:12px;font-weight:700;letter-spacing:.06em;color:var(--ink3)">{{ t.howManyCups }}</div>
                      <div style="display:flex;gap:10px">
                        <sc-for list="{{ rStars }}" as="star" hint-placeholder-count="5">
                          <div onClick="{{ star.go }}" style="{{ star.css }}">
                            <sc-if value="{{ star.isFull }}">
                              <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
                                <path d="M4.8 10.2c0 8.3 4.5 14 11.2 14s11.2-5.7 11.2-14Z" fill="currentColor"/>
                                <path d="M9.4 18.6l1.7-1.7 1.7 1.7 1.6-1.7 1.7 1.7 1.7-1.7 1.7 1.7" stroke="var(--surface)" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" opacity=".38" fill="none"/>
                                <path d="M13.5 24.1h5v2.1h-5Z" fill="currentColor"/>
                                <ellipse cx="16" cy="26.9" rx="5.3" ry="1.5" fill="currentColor"/>
                                <ellipse cx="16" cy="10.2" rx="11.2" ry="3.1" fill="#FBF4E8"/>
                                <ellipse cx="16" cy="10.2" rx="11.2" ry="3.1" stroke="currentColor" stroke-width="1.1" opacity=".45"/>
                                <circle cx="11.9" cy="9.6" r="1" fill="currentColor" opacity=".2"/>
                                <circle cx="19.4" cy="10.7" r=".75" fill="currentColor" opacity=".17"/>
                                <circle cx="15.7" cy="11.1" r=".55" fill="currentColor" opacity=".15"/>
                              </svg>
                            </sc-if>
                            <sc-if value="{{ star.isEmpty }}">
                              <svg width="40" height="40" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.7">
                                <path d="M4.8 10.2c0 8.3 4.5 14 11.2 14s11.2-5.7 11.2-14" stroke-linecap="round" fill="none"/>
                                <ellipse cx="16" cy="10.2" rx="11.2" ry="3.1" fill="none"/>
                                <path d="M13.5 24.3v1.6M18.5 24.3v1.6" stroke-linecap="round"/>
                                <ellipse cx="16" cy="26.9" rx="5.3" ry="1.5" fill="none"/>
                              </svg>
                            </sc-if>
                          </div>
                        </sc-for>
                      </div>
                      <div style="font-size:14px;font-weight:700;color:var(--ink)">{{ rLabel }}</div>
                    </div>
  
                    <div style="display:flex;flex-direction:column;gap:11px">
                      <div style="font-size:14.5px;font-weight:700;color:var(--ink)">{{ t.whatShouldKnow }}</div>
                      <textarea value="{{ rText }}" onChange="{{ setRText }}" placeholder="What you ordered, what it cost, whether you would send a friend…" aria-label="Your review" style="min-height:128px;padding:16px;border-radius:18px;background:var(--surface);border:1px solid var(--line);font-family:'Plus Jakarta Sans',system-ui,sans-serif;font-size:14.5px;line-height:1.6;color:var(--ink);outline:none;resize:none"></textarea>
                    </div>
  
                    <div style="display:flex;flex-direction:column;gap:11px">
                      <div style="display:flex;align-items:baseline;justify-content:space-between">
                        <div style="font-size:14.5px;font-weight:700;color:var(--ink)">{{ t.addPhotos }}</div>
                        <div style="font-size:12.5px;color:var(--ink3)">{{ t.optionalUpTo10 }}</div>
                      </div>
                      <div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr) minmax(0,1fr);gap:10px">
                        <div style="aspect-ratio:1;border-radius:16px;overflow:hidden;background:var(--imgbg)"><image-slot id="v2-rev-a" shape="rect" placeholder="Your photo"></image-slot></div>
                        <div style="aspect-ratio:1;border-radius:16px;overflow:hidden;background:var(--imgbg)"><image-slot id="v2-rev-b" shape="rect" placeholder="Your photo"></image-slot></div>
                        <div onClick="{{ rAddPhoto }}" role="button" tabIndex="0" aria-label="Add a photo" style="aspect-ratio:1;border-radius:16px;background:var(--surface);border:1.5px dashed var(--line);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;cursor:pointer">
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color:var(--brand)"><path d="M12 5v14M5 12h14" stroke-width="2.2" stroke-linecap="round"/></svg>
                          <div style="font-size:11px;font-weight:700;color:var(--ink3)">{{ t.add }}</div>
                        </div>
                      </div>
                    </div>
  
                    <div style="display:flex;gap:12px;padding:16px;border-radius:18px;background:var(--greenSoft)">
                      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color:var(--green);flex:0 0 19px;margin-top:1px"><path d="M12 3.5 19.5 7v5.5c0 4.4-3.1 7.6-7.5 9-4.4-1.4-7.5-4.6-7.5-9V7L12 3.5Z" stroke-width="1.9" stroke-linejoin="round"/><path d="M9 12.2l2 2 4-4.2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                      <div style="flex:1;font-size:13px;line-height:1.55;color:var(--ink2);text-wrap:pretty">{{ t.checkedInNote }} <span style="font-weight:700;color:var(--green)">{{ t.verifiedWord }}</span> {{ t.earns2500 }}</div>
                    </div>
                  </div>
  
                  <div style="position:sticky;bottom:0;padding:14px 22px 20px;background:var(--bg);border-top:1px solid var(--line)">
                    <div onClick="{{ rPost }}" role="button" tabIndex="0" style="{{ rPostCss }}">{{ rPostLabel }}</div>
                  </div>
                </div>
              </sc-if>
  
              <sc-if value="{{ isTrips }}">
                <div data-screen-label="My trips" style="padding:8px 22px 32px;display:flex;flex-direction:column;gap:22px">
                  <div style="display:flex;align-items:center;gap:12px">
                    <div onClick="{{ back }}" role="button" tabIndex="0" aria-label="Go back" style="width:42px;height:42px;flex:0 0 42px;border-radius:14px;background:var(--surface);border:1px solid var(--line);display:flex;align-items:center;justify-content:center;cursor:pointer">
                      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color:var(--ink)"><path d="M15 5l-7 7 7 7" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </div>
                    <div style="font-size:23px;font-weight:800;letter-spacing:-.035em;color:var(--ink)">{{ t.myTrips }}</div>
                  </div>
  
                  <div style="display:flex;flex-direction:column;gap:16px">
                    <sc-for list="{{ trips }}" as="t" hint-placeholder-count="3">
                      <div onClick="{{ t.go }}" style="{{ t.css }}">
                        <!-- The real shape of this trip, drawn from the
                             coordinates of the places it visits. Every card
                             used to show the same hand-placed line. -->
                        <div style="position:relative;height:112px;background:var(--surface2)">
                          <sc-if value="{{ t.hasRoute }}">
                            <div style="position:absolute;inset:0">{{ t.routeMap }}</div>
                          </sc-if>
                          <sc-if value="{{ t.isActive }}">
                            <div style="position:absolute;top:12px;right:12px;padding:6px 11px;border-radius:99px;background:var(--brand);font-size:10.5px;font-weight:800;letter-spacing:.06em;color:var(--brandInk)">{{ t.activeCaps }}</div>
                          </sc-if>
                        </div>
                        <div style="padding:16px 17px 17px;display:flex;flex-direction:column;gap:13px">
                          <div>
                            <div style="font-size:17.5px;font-weight:800;letter-spacing:-.03em;color:var(--ink);line-height:1.2">{{ t.name }}</div>
                            <div style="margin-top:5px;font-size:13px;color:var(--ink2)">{{ t.when }} · {{ t.stops }}</div>
                          </div>
                          <div style="display:flex;flex-wrap:wrap;gap:7px">
                            <sc-for list="{{ t.tags }}" as="tg" hint-placeholder-count="3">
                              <div style="padding:7px 12px;border-radius:99px;background:var(--surface2);font-size:12px;font-weight:600;color:var(--ink2)">{{ tg }}</div>
                            </sc-for>
                          </div>
                          <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding-top:12px;border-top:1px solid var(--line)">
                            <div>
                              <div style="font-size:11px;font-weight:700;letter-spacing:.05em;color:var(--ink3)">{{ t.estCost }}</div>
                              <div style="margin-top:4px;font-size:14px;font-weight:800;color:var(--ink)">{{ t.cost }}</div>
                            </div>
                            <div>
                              <div style="font-size:11px;font-weight:700;letter-spacing:.05em;color:var(--ink3)">{{ t.travelCaps }}</div>
                              <div style="margin-top:4px;font-size:14px;font-weight:800;color:var(--ink)">{{ t.time }}</div>
                            </div>
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color:var(--ink3);flex:0 0 17px"><path d="M9 5l7 7-7 7" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                          </div>
                        </div>
                      </div>
                    </sc-for>
                  </div>
  
                  <div onClick="{{ goAi }}" style="display:flex;align-items:center;justify-content:center;gap:10px;height:56px;border-radius:18px;background:var(--brand);cursor:pointer;box-shadow:var(--shadowLg)">
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" style="color:var(--brandInk);flex:0 0 19px"><path d="M12 3.2l2 5.4 5.4 2-5.4 2-2 5.4-2-5.4-5.4-2 5.4-2 2-5.4Z" fill="currentColor"/></svg>
                    <div style="font-size:16px;font-weight:700;color:var(--brandInk)">{{ t.planAnother }}</div>
                  </div>
                </div>
              </sc-if>
  
              <sc-if value="{{ isPhrase }}">
                <div data-screen-label="Phrasebook" style="padding:8px 0 32px;display:flex;flex-direction:column;gap:20px">
                  <div style="padding:0 22px;display:flex;align-items:center;gap:12px">
                    <div onClick="{{ back }}" role="button" tabIndex="0" aria-label="Go back" style="width:42px;height:42px;flex:0 0 42px;border-radius:14px;background:var(--surface);border:1px solid var(--line);display:flex;align-items:center;justify-content:center;cursor:pointer">
                      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color:var(--ink)"><path d="M15 5l-7 7 7 7" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </div>
                    <div style="flex:1">
                      <div style="font-size:23px;font-weight:800;letter-spacing:-.035em;color:var(--ink)">{{ t.phrasebook }}</div>
                      <div style="margin-top:3px;font-size:12.5px;color:var(--ink3)">{{ recordedCount }}</div>
                    </div>
                  </div>
  
                  <div class="nomScroll" style="display:flex;gap:8px;overflow-x:auto;padding:0 22px 2px">
                    <sc-for list="{{ phraseTabs }}" as="pt" hint-placeholder-count="5">
                      <div onClick="{{ pt.go }}" style="{{ pt.css }}">{{ pt.name }}</div>
                    </sc-for>
                  </div>
  
                  <div style="padding:0 22px;display:flex;flex-direction:column;gap:11px">
                    <sc-for list="{{ phraseItems }}" as="ph" hint-placeholder-count="6">
                      <div style="display:flex;align-items:center;gap:14px;padding:16px;border-radius:18px;background:var(--surface);border:1px solid var(--line);box-shadow:var(--shadow)">
                        <div style="flex:1;min-width:0">
                          <div style="font-size:12.5px;font-weight:600;color:var(--ink3)">{{ ph.en }}</div>
                          <div style="margin-top:6px;font-size:17px;font-weight:800;letter-spacing:-.024em;color:var(--ink)">{{ ph.ky }}</div>
                          <div style="margin-top:5px;font-size:13px;font-weight:700;color:var(--brand)">{{ ph.tr }}</div>
                        </div>
                        <div onClick="{{ ph.go }}" role="button" tabIndex="0" aria-label="{{ ph.label }}" style="{{ ph.css }}">
                          <sc-if value="{{ ph.isPlaying }}">
                            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M5 9.5h3l4.5-4v13l-4.5-4H5v-5Z" stroke-width="1.9" stroke-linejoin="round"/><path d="M16.5 9a4.5 4.5 0 0 1 0 6" stroke-width="1.9" stroke-linecap="round"><animate attributeName="opacity" values="1;.25;1" dur="1s" repeatCount="indefinite"/></path><path d="M19.4 6.6a9 9 0 0 1 0 10.8" stroke-width="1.9" stroke-linecap="round"><animate attributeName="opacity" values=".25;1;.25" dur="1s" repeatCount="indefinite"/></path></svg>
                          </sc-if>
                          <sc-if value="{{ ph.isIdle }}">
                            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M5 9.5h3l4.5-4v13l-4.5-4H5v-5Z" stroke-width="1.9" stroke-linejoin="round"/><path d="M16.5 9a4.5 4.5 0 0 1 0 6" stroke-width="1.9" stroke-linecap="round"/></svg>
                          </sc-if>
                          <sc-if value="{{ ph.isRecorded }}">
                            <div title="Recorded by a native speaker" style="position:absolute;top:-3px;right:-3px;width:14px;height:14px;border-radius:50%;background:var(--green);border:2px solid var(--surface);display:flex;align-items:center;justify-content:center">
                              <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="#FFF"><path d="M5 12.5l4.5 4.5L19 7" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>
                            </div>
                          </sc-if>
                        </div>
                      </div>
                    </sc-for>
                  </div>
                </div>
              </sc-if>
  
              <sc-if value="{{ isCurrency }}">
                <div data-screen-label="Currency" style="padding:8px 22px 32px;display:flex;flex-direction:column;gap:22px">
                  <div style="display:flex;align-items:center;gap:12px">
                    <div onClick="{{ back }}" role="button" tabIndex="0" aria-label="Go back" style="width:42px;height:42px;flex:0 0 42px;border-radius:14px;background:var(--surface);border:1px solid var(--line);display:flex;align-items:center;justify-content:center;cursor:pointer">
                      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color:var(--ink)"><path d="M15 5l-7 7 7 7" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </div>
                    <div style="font-size:23px;font-weight:800;letter-spacing:-.035em;color:var(--ink)">{{ t.currency }}</div>
                  </div>
  
                  <div style="padding:22px;border-radius:22px;background:var(--surface);border:1px solid var(--line);box-shadow:var(--shadow);display:flex;flex-direction:column;gap:18px">
                    <div>
                      <div style="font-size:11.5px;font-weight:700;letter-spacing:.06em;color:var(--ink3)">{{ t.youHave }}</div>
                      <div style="margin-top:10px;display:flex;align-items:center;gap:12px">
                        <input value="{{ amount }}" onChange="{{ setAmount }}" inputMode="decimal" placeholder="0" style="flex:1;min-width:0;background:transparent;border:none;outline:none;font-family:'Plus Jakarta Sans',system-ui,sans-serif;font-size:38px;font-weight:800;letter-spacing:-.042em;color:var(--ink);padding:0" />
                        <!-- The currency is chosen where it is shown. It used
                             to mean scrolling past the rest of the screen to a
                             list at the bottom, which only gets worse as more
                             currencies are added. -->
                        <div onClick="{{ toggleCurPick }}" role="button" tabIndex="0" aria-label="{{ t.convertFrom }}" style="flex:0 0 auto;display:flex;align-items:center;gap:7px;padding:10px 13px 10px 15px;border-radius:13px;background:var(--brandSoft);font-size:15px;font-weight:800;color:var(--brand);cursor:pointer">
                          {{ curCode }}
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="{{ curCaretCss }}"><path d="M6 9.5l6 6 6-6" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        </div>
                      </div>
                      <div style="margin-top:6px;font-size:12.5px;color:var(--ink3)">{{ curName }}</div>

                      <sc-if value="{{ curPicking }}">
                        <div class="nomScroll" style="margin-top:12px;max-height:232px;overflow-y:auto;border:1px solid var(--line);border-radius:15px;background:var(--bg)">
                          <sc-for list="{{ curPick }}" as="cp" hint-placeholder-count="6">
                            <div onClick="{{ cp.go }}" role="button" tabIndex="0" style="{{ cp.css }}">
                              <div style="width:44px;flex:0 0 44px;font-size:13px;font-weight:800;color:var(--ink)">{{ cp.code }}</div>
                              <div style="flex:1;min-width:0;font-size:13.5px;color:var(--ink2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ cp.name }}</div>
                              <sc-if value="{{ cp.isOn }}">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color:var(--brand);flex:0 0 16px"><path d="M5 12.5l4.5 4.5L19 7" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
                              </sc-if>
                            </div>
                          </sc-for>
                        </div>
                      </sc-if>
                    </div>
  
                    <div style="height:1px;background:var(--line)"></div>
  
                    <div>
                      <div style="font-size:11.5px;font-weight:700;letter-spacing:.06em;color:var(--ink3)">{{ t.youGet }}</div>
                      <div style="margin-top:10px;font-size:38px;font-weight:800;letter-spacing:-.042em;color:var(--green)">{{ curOut }}</div>
                      <div style="margin-top:8px;display:flex;align-items:center;gap:8px;font-size:12.5px;color:var(--ink2)">
                        <span style="width:7px;height:7px;border-radius:50%;background:var(--green)"></span>
                        {{ curRate }}
                      </div>
                    </div>
                  </div>
  
                  <div style="display:flex;gap:8px">
                    <sc-for list="{{ quickAmts }}" as="q" hint-placeholder-count="5">
                      <div onClick="{{ q.go }}" style="{{ q.css }}">{{ q.n }}</div>
                    </sc-for>
                  </div>
  
                  <div style="display:flex;flex-direction:column;gap:12px">
                    <div style="font-size:16px;font-weight:800;letter-spacing:-.024em;color:var(--ink)">{{ t.whatThatBuys }}</div>
                    <sc-for list="{{ curAnchors }}" as="an" hint-placeholder-count="5">
                      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:15px 16px;border-radius:16px;background:var(--surface);border:1px solid var(--line)">
                        <div style="flex:1;min-width:0;font-size:14px;color:var(--ink)">{{ an.name }}</div>
                        <div style="text-align:right">
                          <div style="font-size:14px;font-weight:800;color:var(--ink)">{{ an.som }}</div>
                          <div style="margin-top:2px;font-size:11.5px;color:var(--ink3)">{{ an.conv }}</div>
                        </div>
                      </div>
                    </sc-for>
                  </div>
  
                </div>
              </sc-if>
  
              <sc-if value="{{ isSos }}">
                <div data-screen-label="Emergency" style="padding:8px 22px 32px;display:flex;flex-direction:column;gap:22px">
                  <div style="display:flex;align-items:center;gap:12px">
                    <div onClick="{{ back }}" role="button" tabIndex="0" aria-label="Go back" style="width:42px;height:42px;flex:0 0 42px;border-radius:14px;background:var(--surface);border:1px solid var(--line);display:flex;align-items:center;justify-content:center;cursor:pointer">
                      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color:var(--ink)"><path d="M15 5l-7 7 7 7" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </div>
                    <div style="flex:1">
                      <div style="font-size:23px;font-weight:800;letter-spacing:-.035em;color:var(--ink)">{{ t.emergency }}</div>
                      <div style="margin-top:3px;font-size:12.5px;color:var(--ink3)">{{ t.emergencySub }}</div>
                    </div>
                  </div>
  
                  <!-- Our own desk, above the national numbers but visibly
                       not one of them: 112 is what you call when it is an
                       emergency, this is who you call when you are stuck.
                       Channels appear only where nomad-config.js has real
                       details; the assistant is always offered because it
                       needs nothing configured. -->
                  <div style="padding:16px 17px;border-radius:20px;background:var(--greenSoft);display:flex;flex-direction:column;gap:12px">
                    <div style="display:flex;align-items:flex-start;gap:11px">
                      <div style="width:34px;height:34px;flex:0 0 34px;border-radius:11px;background:var(--green);display:flex;align-items:center;justify-content:center">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color:#FFF"><path d="M18.5 12a6.5 6.5 0 0 0-13 0" stroke-width="1.9" stroke-linecap="round"/><rect x="3" y="12" width="3.6" height="6" rx="1.6" stroke-width="1.9"/><rect x="17.4" y="12" width="3.6" height="6" rx="1.6" stroke-width="1.9"/><path d="M19.2 18v.6a2.4 2.4 0 0 1-2.4 2.4H13" stroke-width="1.9" stroke-linecap="round"/></svg>
                      </div>
                      <div style="flex:1;min-width:0">
                        <div style="font-size:15.5px;font-weight:800;letter-spacing:-.024em;color:var(--ink)">{{ supportTitle }}</div>
                        <div style="margin-top:3px;font-size:12.5px;line-height:1.45;color:var(--ink2);text-wrap:pretty">{{ supportSub }}</div>
                      </div>
                    </div>
                    <!-- The numbers are shown in full so they can be read
                         and dialled by hand too, which matters on the one
                         screen someone opens when things have gone wrong. -->
                    <sc-for list="{{ supportNumbers }}" as="sn" hint-placeholder-count="2">
                      <div style="display:flex;align-items:center;gap:9px;padding:10px 12px;border-radius:14px;background:var(--surface)">
                        <div style="flex:1;min-width:0;font-size:14px;font-weight:800;letter-spacing:-.02em;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ sn.label }}</div>
                        <sc-if value="{{ sn.hasWhatsapp }}">
                          <div onClick="{{ sn.wa }}" role="button" tabIndex="0" aria-label="{{ sn.waLabel }}" style="display:flex;align-items:center;gap:6px;padding:9px 13px;border-radius:11px;background:#25D366;font-size:12.5px;font-weight:700;color:#FFF;cursor:pointer;white-space:nowrap">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="flex:0 0 14px"><path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2Zm5.6 14.2c-.2.6-1.2 1.2-1.7 1.2-.5.1-1 .1-1.6-.1a12 12 0 0 1-6.5-5.7c-.5-.8-.8-1.7-.8-2.5 0-.8.4-1.4.8-1.8.2-.2.4-.3.6-.3h.5c.2 0 .4 0 .5.4l.8 1.9c0 .2 0 .4-.1.5l-.4.5c-.1.2-.3.3-.1.6.4.7.9 1.3 1.5 1.8.6.5 1.1.8 1.4.9.3.1.4 0 .6-.1l.8-.9c.2-.2.3-.2.5-.1l1.8.9c.2.1.3.2.4.3 0 .1 0 .4-.2.9Z"/></svg>
                            WhatsApp
                          </div>
                        </sc-if>
                        <div onClick="{{ sn.call }}" role="button" tabIndex="0" aria-label="{{ sn.callLabel }}" style="width:38px;height:38px;flex:0 0 38px;border-radius:11px;background:var(--greenSoft);display:flex;align-items:center;justify-content:center;cursor:pointer">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color:var(--green)"><path d="M6.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 4.5 5.5a2 2 0 0 1 2-2Z" stroke-width="1.9" stroke-linejoin="round"/></svg>
                        </div>
                      </div>
                    </sc-for>

                    <div style="display:flex;flex-wrap:wrap;gap:8px">
                      <sc-for list="{{ supportChannels }}" as="sc" hint-placeholder-count="2">
                        <div onClick="{{ sc.go }}" role="button" tabIndex="0" aria-label="{{ sc.label }}" style="{{ sc.css }}">
                          <span style="{{ sc.iconCss }}">{{ sc.icon }}</span>{{ sc.name }}
                        </div>
                      </sc-for>
                    </div>
                  </div>

                  <div onClick="{{ call112 }}" role="button" tabIndex="0" aria-label="Call 112" style="height:82px;border-radius:20px;background:var(--brand);display:flex;align-items:center;justify-content:center;gap:14px;cursor:pointer;box-shadow:var(--shadowLg)">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color:var(--brandInk);flex:0 0 26px"><path d="M6.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 4.5 5.5a2 2 0 0 1 2-2Z" stroke-width="1.9" stroke-linejoin="round"/></svg>
                    <div>
                      <div style="font-size:26px;font-weight:800;letter-spacing:-.035em;color:var(--brandInk);line-height:1.1">{{ t.call112 }}</div>
                      <div style="margin-top:2px;font-size:12px;font-weight:600;color:var(--brandInk);opacity:.8">{{ t.allServices }}</div>
                    </div>
                  </div>

                  <div style="display:flex;gap:10px">
                    <div onClick="{{ call103 }}" role="button" tabIndex="0" aria-label="Call 103, ambulance" style="flex:1;padding:17px 8px;border-radius:17px;background:var(--surface);border:1px solid var(--line);text-align:center;cursor:pointer;box-shadow:var(--shadow)">
                      <div style="font-size:21px;font-weight:800;letter-spacing:-.032em;color:var(--ink)">103</div>
                      <div style="margin-top:5px;font-size:12px;font-weight:600;color:var(--ink3)">{{ t.ambulance }}</div>
                    </div>
                    <div onClick="{{ call102 }}" role="button" tabIndex="0" aria-label="Call 102, police" style="flex:1;padding:17px 8px;border-radius:17px;background:var(--surface);border:1px solid var(--line);text-align:center;cursor:pointer;box-shadow:var(--shadow)">
                      <div style="font-size:21px;font-weight:800;letter-spacing:-.032em;color:var(--ink)">102</div>
                      <div style="margin-top:5px;font-size:12px;font-weight:600;color:var(--ink3)">{{ t.police }}</div>
                    </div>
                    <div onClick="{{ call101 }}" role="button" tabIndex="0" aria-label="Call 101, fire" style="flex:1;padding:17px 8px;border-radius:17px;background:var(--surface);border:1px solid var(--line);text-align:center;cursor:pointer;box-shadow:var(--shadow)">
                      <div style="font-size:21px;font-weight:800;letter-spacing:-.032em;color:var(--ink)">101</div>
                      <div style="margin-top:5px;font-size:12px;font-weight:600;color:var(--ink3)">{{ t.fire }}</div>
                    </div>
                  </div>

                  <div onClick="{{ callTourist }}" role="button" tabIndex="0" aria-label="Call the tourist police" style="padding:17px;border-radius:18px;background:var(--surface);border:1px solid var(--line);box-shadow:var(--shadow);cursor:pointer">
                    <div style="font-size:11.5px;font-weight:700;letter-spacing:.06em;color:var(--brand)">{{ t.touristPolice }}</div>
                    <div style="margin-top:9px;display:flex;align-items:center;gap:10px">
                      <div style="flex:1;font-size:19px;font-weight:800;letter-spacing:-.03em;color:var(--ink)">+996 705 00 91 02</div>
                      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color:var(--brand);flex:0 0 19px"><path d="M6.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 4.5 5.5a2 2 0 0 1 2-2Z" stroke-width="1.9" stroke-linejoin="round"/></svg>
                    </div>
                    <div style="margin-top:5px;font-size:12.5px;color:var(--ink3)">WhatsApp available · Bishkek &amp; Issyk-Kul</div>
                  </div>
  
                  <div style="display:flex;flex-direction:column;gap:11px">
                    <div style="font-size:16px;font-weight:800;letter-spacing:-.024em;color:var(--ink)">{{ t.nearestToYou }}</div>
                    <div style="display:flex;align-items:center;gap:13px;padding:16px;border-radius:17px;background:var(--surface);border:1px solid var(--line)">
                      <div style="width:40px;height:40px;flex:0 0 40px;border-radius:13px;background:var(--brandSoft);display:flex;align-items:center;justify-content:center">
                        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color:var(--brand)"><path d="M12 7v10M7 12h10" stroke-width="2.2" stroke-linecap="round"/><rect x="3.5" y="3.5" width="17" height="17" rx="4" stroke-width="1.8"/></svg>
                      </div>
                      <div style="flex:1;min-width:0">
                        <div style="font-size:14.5px;font-weight:700;color:var(--ink)">City Hospital №1</div>
                        <div style="margin-top:3px;font-size:12.5px;color:var(--ink3)">1.2 km · open 24 h · English at reception</div>
                      </div>
                    </div>
                    <div style="display:flex;align-items:center;gap:13px;padding:16px;border-radius:17px;background:var(--surface);border:1px solid var(--line)">
                      <div style="width:40px;height:40px;flex:0 0 40px;border-radius:13px;background:var(--greenSoft);display:flex;align-items:center;justify-content:center">
                        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color:var(--green)"><rect x="3.5" y="7.5" width="17" height="13" rx="3" stroke-width="1.8"/><path d="M9 7.5V5.5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M12 11.5v5M9.5 14h5" stroke-width="1.8" stroke-linecap="round"/></svg>
                      </div>
                      <div style="flex:1;min-width:0">
                        <div style="font-size:14.5px;font-weight:700;color:var(--ink)">Neman Pharmacy</div>
                        <div style="margin-top:3px;font-size:12.5px;color:var(--ink3)">240 m · open 24 h</div>
                      </div>
                    </div>
                  </div>
  
                  <div onClick="{{ shareLocation }}" role="button" tabIndex="0" style="display:flex;align-items:center;justify-content:center;gap:10px;height:54px;border-radius:17px;background:var(--surface);border:1px solid var(--line);cursor:pointer;box-shadow:var(--shadow)">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color:var(--brand);flex:0 0 18px"><path d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Z" stroke-width="1.9" stroke-linejoin="round"/><circle cx="12" cy="10" r="2.5" stroke-width="1.9"/></svg>
                    <div style="font-size:14.5px;font-weight:700;color:var(--ink)">{{ t.shareLocation }}</div>
                  </div>
                </div>
              </sc-if>
  
              <sc-if value="{{ isProfile }}">
                <div data-screen-label="Profile" style="padding:8px 22px 32px;display:flex;flex-direction:column;gap:26px">
                  <div style="display:flex;align-items:center;gap:16px">
                    <div style="width:66px;height:66px;flex:0 0 66px;border-radius:50%;background:var(--brandSoft);border:1px solid var(--line);display:flex;align-items:center;justify-content:center;font-size:21px;font-weight:800;color:var(--brand)">{{ initials }}</div>
                    <div style="flex:1;min-width:0">
                      <div style="display:flex;align-items:center;gap:9px">
                        <div style="flex:1;min-width:0;font-size:23px;font-weight:800;letter-spacing:-.035em;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ fullName }}</div>
                        <!-- Editing your own name belongs beside your name, not
                             at the foot of a list of unrelated settings. -->
                        <div onClick="{{ goEditProfile }}" role="button" tabIndex="0" aria-label="{{ t.mEdit }}" style="width:34px;height:34px;flex:0 0 34px;border-radius:11px;background:var(--surface);border:1px solid var(--line);display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:var(--shadow)">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color:var(--brand)"><path d="M4 20h4L20 8l-4-4L4 16v4Z" stroke-width="1.9" stroke-linejoin="round"/><path d="M14.5 5.5 18.5 9.5" stroke-width="1.9"/></svg>
                        </div>
                      </div>
                      <div style="margin-top:4px;font-size:13.5px;color:var(--ink2)">{{ t.from }} {{ countryFlag }} {{ countryLabel }} · {{ levelLabel }}</div>
                    </div>
                  </div>

                  <!-- Each figure leads to what it counts: the tasks, the
                       badges, the XP. They read as buttons, so they were
                       tapped, and nothing happened. -->
                  <div style="display:flex;gap:11px">
                    <div onClick="{{ goVerified }}" role="button" tabIndex="0" style="flex:1;padding:16px 14px;border-radius:18px;background:var(--surface);border:1px solid var(--line);box-shadow:var(--shadow);cursor:pointer">
                      <div style="font-size:21px;font-weight:800;letter-spacing:-.032em;color:var(--ink)">{{ visitedCount }}</div>
                      <div style="margin-top:4px;font-size:12px;font-weight:600;color:var(--ink3)">{{ t.statVerified }}</div>
                    </div>
                    <div onClick="{{ goBadges }}" role="button" tabIndex="0" style="flex:1;padding:16px 14px;border-radius:18px;background:var(--surface);border:1px solid var(--line);box-shadow:var(--shadow);cursor:pointer">
                      <div style="font-size:21px;font-weight:800;letter-spacing:-.032em;color:var(--ink)">{{ badgeCount }}</div>
                      <div style="margin-top:4px;font-size:12px;font-weight:600;color:var(--ink3)">{{ t.statBadges }}</div>
                    </div>
                    <div onClick="{{ goBadges }}" role="button" tabIndex="0" style="flex:1;padding:16px 14px;border-radius:18px;background:var(--surface);border:1px solid var(--line);box-shadow:var(--shadow);cursor:pointer">
                      <div style="font-size:21px;font-weight:800;letter-spacing:-.032em;color:var(--ink)">{{ xpShort }}</div>
                      <div style="margin-top:4px;font-size:12px;font-weight:600;color:var(--ink3)">XP · {{ xpWorth }}</div>
                    </div>
                  </div>
  
                  <div style="display:flex;flex-direction:column;gap:10px">
                    <sc-for list="{{ menu }}" as="m" hint-placeholder-count="7">
                      <div onClick="{{ m.go }}" style="display:flex;align-items:center;gap:14px;padding:16px;border-radius:17px;background:var(--surface);border:1px solid var(--line);cursor:pointer">
                        <div style="width:38px;height:38px;flex:0 0 38px;border-radius:12px;background:var(--surface2);display:flex;align-items:center;justify-content:center">
                          <sc-if value="{{ m.isHeart }}"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color:var(--brand)"><path d="M12 20.5s-7.5-4.7-7.5-9.7a4.3 4.3 0 0 1 7.5-2.8 4.3 4.3 0 0 1 7.5 2.8c0 5-7.5 9.7-7.5 9.7Z" stroke-width="1.9" stroke-linejoin="round"/></svg></sc-if>
                          <sc-if value="{{ m.isRoute }}"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color:var(--brand)"><path d="M6 20V8a3 3 0 0 1 3-3h9" stroke-width="1.9" stroke-linecap="round"/><circle cx="6" cy="20" r="2" stroke-width="1.9"/><path d="M15 2.5 18.5 5 15 7.5" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg></sc-if>
                          <sc-if value="{{ m.isMedal }}"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color:var(--brand)"><circle cx="12" cy="14.5" r="5.5" stroke-width="1.9"/><path d="M8.5 9 6 3h12l-2.5 6" stroke-width="1.9" stroke-linejoin="round"/></svg></sc-if>
                          <sc-if value="{{ m.isBook }}"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color:var(--brand)"><path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5v-13Z" stroke-width="1.8" stroke-linejoin="round"/><path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H13v16h5.5A1.5 1.5 0 0 0 20 18.5v-13Z" stroke-width="1.8" stroke-linejoin="round"/></svg></sc-if>
                          <sc-if value="{{ m.isSwap }}"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color:var(--brand)"><path d="M4 8h13m0 0-3.2-3.2M17 8l-3.2 3.2M20 16H7m0 0 3.2-3.2M7 16l3.2 3.2" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg></sc-if>
                          <sc-if value="{{ m.isAlert }}"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color:var(--brand)"><path d="M12 3.5 21 19H3l9-15.5Z" stroke-width="1.9" stroke-linejoin="round"/><path d="M12 9.5v4M12 16.2v.3" stroke-width="2" stroke-linecap="round"/></svg></sc-if>
                          <sc-if value="{{ m.isGlobe }}"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color:var(--brand)"><circle cx="12" cy="12" r="9" stroke-width="1.8"/><path d="M3.4 9.5h17.2M3.4 14.5h17.2" stroke-width="1.6"/><path d="M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18Z" stroke-width="1.6"/></svg></sc-if>
                        <sc-if value="{{ m.isCog }}"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color:var(--brand)"><circle cx="12" cy="12" r="3.2" stroke-width="1.9"/><path d="M12 3v2.2M12 18.8V21M4.6 7.8l1.9 1.1M17.5 15.1l1.9 1.1M4.6 16.2l1.9-1.1M17.5 8.9l1.9-1.1" stroke-width="1.9" stroke-linecap="round"/></svg></sc-if>
                        </div>
                        <div style="flex:1;font-size:15px;font-weight:600;color:var(--ink)">{{ m.name }}</div>
                        <div style="font-size:12.5px;color:var(--ink3)">{{ m.meta }}</div>
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color:var(--ink3);flex:0 0 17px"><path d="M9 5l7 7-7 7" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                      </div>
                    </sc-for>
                  </div>
                </div>
              </sc-if>
  
            </div>
          </div>
  
          <sc-if value="{{ showTabs }}" hint-placeholder-val="{{ true }}">
            <div data-ref="tabBar" style="position:relative;z-index:5;flex:0 0 auto;background:var(--surface);border-top:1px solid var(--line)">
              <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;padding:10px 10px 4px">
                <div onClick="{{ goHome }}" role="button" tabIndex="0" aria-label="Home" style="{{ tabHome }}">
                  <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1v-9.5Z" stroke-width="1.9" stroke-linejoin="round"/></svg>
                  <div style="font-size:11px;font-weight:700">{{ t.tabHome }}</div>
                </div>
                <div onClick="{{ goMapTab }}" role="button" tabIndex="0" aria-label="Map" style="{{ tabMap }}">
                  <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M9 20 3 22V6l6-2 6 2 6-2v16l-6 2-6-2Z" stroke-width="1.9" stroke-linejoin="round"/><path d="M9 4v16M15 6v16" stroke-width="1.9"/></svg>
                  <div style="font-size:11px;font-weight:700">{{ t.tabMap }}</div>
                </div>
                <div onClick="{{ goAiTab }}" role="button" tabIndex="0" aria-label="AI Assistant" style="{{ tabAi }}">
                  <svg width="23" height="23" viewBox="0 0 24 24" fill="none"><path d="M12 3.4l1.9 5.1 5.1 1.9-5.1 1.9L12 17.4l-1.9-5.1L5 10.4l5.1-1.9L12 3.4Z" fill="currentColor"/><path d="M18.4 16.4l.7 1.9 1.9.7-1.9.7-.7 1.9-.7-1.9-1.9-.7 1.9-.7.7-1.9Z" fill="currentColor"/></svg>
                  <div style="font-size:11px;font-weight:700">{{ t.tabAi }}</div>
                </div>
                <div onClick="{{ goProfile }}" role="button" tabIndex="0" aria-label="Profile" style="{{ tabProfile }}">
                  <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="8.4" r="3.6" stroke-width="1.9"/><path d="M4.8 20c0-3.6 3.3-5.6 7.2-5.6s7.2 2 7.2 5.6" stroke-width="1.9" stroke-linecap="round"/></svg>
                  <div style="font-size:11px;font-weight:700">{{ t.tabProfile }}</div>
                </div>
              </div>
              <sc-if value="{{ isIos }}" hint-placeholder-val="{{ true }}">
                <div class="nomFakeNav" style="display:flex;justify-content:center;padding:4px 0 9px"><div style="width:136px;height:5px;border-radius:99px;background:var(--ink3);opacity:.5"></div></div>
              </sc-if>
              <sc-if value="{{ isAndroid }}">
                <div class="nomFakeNav" style="display:flex;align-items:center;justify-content:center;gap:56px;padding:8px 0 11px;color:var(--ink3)">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M15 5l-7 7 7 7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  <div style="width:86px;height:4px;border-radius:99px;background:currentColor"></div>
                  <div style="width:14px;height:14px;border-radius:3px;border:2px solid currentColor"></div>
                </div>
              </sc-if>
            </div>
          </sc-if>
  
          <!-- The assistant, reachable without leaving what you are looking
               at. On the map it also carries what is on screen into the
               question, so "what is near here" means this view. Sits above
               the tab bar and left of the map's zoom column. -->
          <sc-if value="{{ showAiBubble }}">
            <div onClick="{{ goAiFromBubble }}" role="button" tabIndex="0" aria-label="Ask the AI assistant" style="{{ aiBubbleCss }}">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style="color:var(--brandInk);flex:0 0 24px"><path d="M12 3.2l2 5.4 5.4 2-5.4 2-2 5.4-2-5.4-5.4-2 5.4-2 2-5.4Z" fill="currentColor"/><path d="M18.6 15.4l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z" fill="currentColor"/></svg>
              <sc-if value="{{ aiBubbleHasLabel }}">
                <div style="font-size:13px;font-weight:700;color:var(--brandInk);white-space:nowrap">{{ aiBubbleLabel }}</div>
              </sc-if>
            </div>
          </sc-if>

          <!-- Confirmation for things that leave the app — placing a call,
               sharing a location. Desktop browsers do nothing visible when a
               tel: link is followed, so saying what happened is the only
               feedback there is. -->
          <sc-if value="{{ hasToast }}">
            <div data-ref="toastBox" style="position:absolute;left:18px;right:18px;bottom:96px;z-index:28;padding:14px 17px;border-radius:16px;background:var(--ink);box-shadow:var(--shadowLg);display:flex;align-items:center;gap:12px;animation:nomCardUp .26s cubic-bezier(.34,1.28,.5,1) both">
              <div style="flex:1;font-size:13.5px;font-weight:600;line-height:1.45;color:var(--bg);text-wrap:pretty">{{ toast }}</div>
              <div onClick="{{ closeToast }}" role="button" tabIndex="0" aria-label="Dismiss" style="width:24px;height:24px;flex:0 0 24px;border-radius:8px;display:flex;align-items:center;justify-content:center;cursor:pointer;opacity:.6">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color:var(--bg)"><path d="M6 6l12 12M18 6L6 18" stroke-width="2.4" stroke-linecap="round"/></svg>
              </div>
            </div>
          </sc-if>

          <sc-if value="{{ celebrating }}">
            <div style="position:absolute;inset:0;z-index:30;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:26px;padding:34px 26px;background:var(--bg);animation:nomFade .3s ease-out">
              {{ celebConfetti }}
              <div style="position:relative;display:flex;align-items:center;justify-content:center;width:100%;height:240px;flex:0 0 240px;overflow:hidden">
                {{ celebRays }}
                <div style="position:absolute;width:150px;height:150px;border-radius:50%;border:3px solid var(--brand);opacity:.5;animation:nomBurst 1.1s .14s cubic-bezier(.2,.7,.3,1) forwards"></div>
                <div style="position:relative;animation:nomPop .8s cubic-bezier(.34,1.45,.5,1) both;filter:drop-shadow(0 14px 30px rgba(27,20,17,.22))">{{ celebArt }}</div>
              </div>
              <div style="display:flex;flex-direction:column;align-items:center;gap:10px;animation:nomRise .5s .5s ease-out both">
                <div style="font-size:11.5px;font-weight:800;letter-spacing:.18em;color:var(--brand)">BADGE UNLOCKED</div>
                <div style="font-size:28px;font-weight:800;letter-spacing:-.036em;line-height:1.12;text-align:center;color:var(--ink);text-wrap:pretty">{{ celebName }}</div>
                <div style="font-size:14px;color:var(--ink2);text-align:center">{{ celebSub }}</div>
              </div>
              <div style="display:flex;flex-direction:column;align-items:center;gap:8px;animation:nomRise .5s .64s ease-out both">
                <div style="padding:12px 22px;border-radius:99px;background:var(--greenSoft);font-size:20px;font-weight:800;letter-spacing:-.03em;color:var(--green)">{{ celebXp }}</div>
                <div style="font-size:12.5px;font-weight:700;color:var(--ink2)">{{ celebSom }}</div>
              </div>
              <div onClick="{{ closeCeleb }}" role="button" tabIndex="0" style="width:100%;height:56px;border-radius:18px;background:var(--brand);display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:var(--brandInk);cursor:pointer;box-shadow:var(--shadowLg);animation:nomRise .5s .78s ease-out both">Collect</div>
            </div>
          </sc-if>

          <!-- ── First-run onboarding ────────────────────────────────────────
               Not part of the design prototype. Sits above every screen until
               a profile exists, then never shows again. -->
          <sc-if value="{{ isOnboarding }}">
            <div style="{{ obOverlayCss }}">

              <sc-if value="{{ obIsSplash }}">
                <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 34px">
                  <div style="line-height:0;animation:nomLogoIn 1.05s cubic-bezier(.22,1,.36,1) both">{{ logoMark }}</div>
                  <div style="margin-top:22px;line-height:0;animation:nomSoftUp .8s .34s cubic-bezier(.22,1,.36,1) both">{{ logoWord }}</div>
                  <div style="margin-top:18px;font-size:15px;line-height:1.6;text-align:center;color:var(--ink2);text-wrap:pretty;animation:nomSoftUp .8s .5s cubic-bezier(.22,1,.36,1) both">{{ t.splashSub }}</div>
                </div>
                <div style="padding:0 26px 32px;display:flex;flex-direction:column;gap:13px;animation:nomSoftUp .8s .66s cubic-bezier(.22,1,.36,1) both">
                  <div onClick="{{ obNext }}" role="button" tabIndex="0" style="height:56px;border-radius:18px;background:var(--brand);display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:var(--brandInk);cursor:pointer;box-shadow:var(--shadowLg)">{{ t.getStarted }}</div>
                  <div style="text-align:center;font-size:12px;line-height:1.5;color:var(--ink3)">{{ t.takesASec }}</div>
                </div>
              </sc-if>

              <sc-if value="{{ obIsForm }}">
                <div style="flex:0 0 auto;padding:18px 22px 0;display:flex;align-items:center;gap:12px">
                  <div onClick="{{ obBack }}" role="button" tabIndex="0" aria-label="Go back" style="width:42px;height:42px;flex:0 0 42px;border-radius:14px;background:var(--surface);border:1px solid var(--line);display:flex;align-items:center;justify-content:center;cursor:pointer">
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color:var(--ink)"><path d="M15 5l-7 7 7 7" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  </div>
                  <!-- Three-step progress means nothing when Profile has
                       opened a single field to change. -->
                  <sc-if value="{{ obShowSteps }}">
                    <div style="flex:1;display:flex;align-items:center;gap:6px">
                      <sc-for list="{{ obDots }}" as="dot" hint-placeholder-count="2">
                        <div style="{{ dot.css }}"></div>
                      </sc-for>
                    </div>
                    <div style="flex:0 0 auto;font-size:12px;font-weight:700;color:var(--ink3)">{{ obStepLabel }}</div>
                  </sc-if>
                </div>
              </sc-if>

              <sc-if value="{{ obIsLang }}">
                <div data-ob-pane="lang" style="flex:1;overflow-y:auto;padding:26px 26px 0" class="nomScroll">
                  <div style="font-size:27px;font-weight:800;letter-spacing:-.036em;line-height:1.15;color:var(--ink);text-wrap:pretty">{{ t.langTitle }}</div>
                  <div style="margin-top:10px;font-size:14.5px;line-height:1.55;color:var(--ink2);text-wrap:pretty">{{ t.langSub }}</div>
                  <div style="margin-top:24px;display:flex;flex-direction:column;gap:10px">
                    <sc-for list="{{ obLangs }}" as="lg" hint-placeholder-count="3">
                      <div onClick="{{ lg.go }}" role="button" tabIndex="0" aria-label="{{ lg.name }}" style="{{ lg.css }}">
                        <div style="line-height:0;flex:0 0 auto">{{ lg.flag }}</div>
                        <div style="flex:1;min-width:0">
                          <div style="font-size:16px;font-weight:700;color:var(--ink)">{{ lg.native }}</div>
                          <sc-if value="{{ lg.hasAlt }}">
                            <div style="margin-top:2px;font-size:12.5px;color:var(--ink3)">{{ lg.name }}</div>
                          </sc-if>
                        </div>
                        <sc-if value="{{ lg.isOn }}">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color:var(--brand);flex:0 0 18px"><path d="M5 12.5l4.5 4.5L19 7" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        </sc-if>
                      </div>
                    </sc-for>
                  </div>
                </div>
              </sc-if>

              <sc-if value="{{ obIsName }}">
                <div data-ob-pane="name" style="flex:1;overflow-y:auto;padding:26px 26px 0" class="nomScroll">
                  <div style="font-size:27px;font-weight:800;letter-spacing:-.036em;line-height:1.15;color:var(--ink);text-wrap:pretty">{{ t.nameTitle }}</div>
                  <div style="margin-top:10px;font-size:14.5px;line-height:1.55;color:var(--ink2);text-wrap:pretty">{{ t.nameSub }}</div>

                  <div style="margin-top:26px;display:flex;flex-direction:column;gap:16px">
                    <div>
                      <div style="font-size:12px;font-weight:700;letter-spacing:.06em;color:var(--ink3)">{{ t.firstName }}</div>
                      <input value="{{ obFirst }}" onChange="{{ setObFirst }}" onKeyDown="{{ obKey }}" data-autofocus="1" placeholder="Alex" aria-label="First name" autocomplete="given-name" style="{{ obFirstCss }}" />
                    </div>
                    <div>
                      <div style="display:flex;align-items:baseline;justify-content:space-between">
                        <div style="font-size:12px;font-weight:700;letter-spacing:.06em;color:var(--ink3)">{{ t.lastName }}</div>
                        <div style="font-size:12px;color:var(--ink3)">{{ t.optional }}</div>
                      </div>
                      <input value="{{ obLast }}" onChange="{{ setObLast }}" onKeyDown="{{ obKey }}" placeholder="Kim" aria-label="Last name" autocomplete="family-name" style="{{ obLastCss }}" />
                    </div>
                  </div>

                  <sc-if value="{{ obHasFirst }}">
                    <div style="margin-top:24px;display:flex;align-items:center;gap:13px;padding:15px 16px;border-radius:17px;background:var(--surface);border:1px solid var(--line);animation:nomIn .3s ease-out">
                      <div style="width:44px;height:44px;flex:0 0 44px;border-radius:50%;background:var(--brandSoft);border:1px solid var(--line);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;color:var(--brand)">{{ obInitials }}</div>
                      <div style="flex:1;min-width:0">
                        <div style="font-size:12px;font-weight:700;letter-spacing:.05em;color:var(--ink3)">{{ t.yourBadge }}</div>
                        <div style="margin-top:4px;font-size:14.5px;font-weight:700;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ t.hello }}, {{ obFirst }}</div>
                      </div>
                    </div>
                  </sc-if>
                </div>
              </sc-if>

              <sc-if value="{{ obIsCountry }}">
                <div data-ob-pane="country" style="flex:0 0 auto;padding:26px 26px 0">
                  <div style="font-size:27px;font-weight:800;letter-spacing:-.036em;line-height:1.15;color:var(--ink);text-wrap:pretty">{{ t.countryTitle }}</div>
                  <div style="margin-top:10px;font-size:14.5px;line-height:1.55;color:var(--ink2);text-wrap:pretty">{{ t.countrySub }}</div>

                  <div style="margin-top:20px;display:flex;align-items:center;gap:11px;height:50px;padding:0 17px;border-radius:16px;background:var(--surface);border:1px solid var(--line);box-shadow:var(--shadow)">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color:var(--ink2);flex:0 0 18px"><circle cx="11" cy="11" r="7" stroke-width="2"/><path d="M16.5 16.5 21 21" stroke-width="2" stroke-linecap="round"/></svg>
                    <input value="{{ obQuery }}" onChange="{{ setObQuery }}" onKeyDown="{{ obKey }}" data-autofocus="1" placeholder="{{ t.searchCountries }}" aria-label="Search countries" style="flex:1;min-width:0;background:transparent;border:none;outline:none;font-family:'Plus Jakarta Sans',system-ui,sans-serif;font-size:14.5px;font-weight:600;color:var(--ink);padding:0" />
                    <sc-if value="{{ obHasQuery }}">
                      <div onClick="{{ obClearQuery }}" role="button" tabIndex="0" aria-label="Clear search" style="width:24px;height:24px;flex:0 0 24px;border-radius:50%;background:var(--surface2);display:flex;align-items:center;justify-content:center;cursor:pointer">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color:var(--ink2)"><path d="M6 6l12 12M18 6L6 18" stroke-width="2.6" stroke-linecap="round"/></svg>
                      </div>
                    </sc-if>
                  </div>

                  <sc-if value="{{ obShowPopular }}">
                    <div class="nomScroll" style="margin-top:12px;display:flex;gap:8px;overflow-x:auto;padding-bottom:2px">
                      <sc-for list="{{ obPopular }}" as="pc" hint-placeholder-count="6">
                        <div onClick="{{ pc.go }}" role="button" tabIndex="0" style="{{ pc.css }}">{{ pc.flag }} {{ pc.name }}</div>
                      </sc-for>
                    </div>
                  </sc-if>
                </div>

                <div class="nomScroll" style="flex:1;min-height:0;overflow-y:auto;padding:14px 26px 8px;display:flex;flex-direction:column;gap:8px">
                  <sc-for list="{{ obCountries }}" as="c" hint-placeholder-count="8">
                    <div onClick="{{ c.go }}" role="button" tabIndex="0" style="{{ c.css }}">
                      <div style="line-height:0;flex:0 0 auto">{{ c.flag }}</div>
                      <div style="flex:1;min-width:0;font-size:14.5px;font-weight:600;color:var(--ink)">{{ c.name }}</div>
                      <sc-if value="{{ c.isOn }}">
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color:var(--brand);flex:0 0 17px"><path d="M5 12.5l4.5 4.5L19 7" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
                      </sc-if>
                    </div>
                  </sc-for>
                  <sc-if value="{{ obNoMatch }}">
                    <div style="padding:26px 10px;text-align:center">
                      <div style="font-size:15px;font-weight:700;color:var(--ink)">{{ t.noCountry }}</div>
                      <div style="margin-top:6px;font-size:13px;line-height:1.5;color:var(--ink2)">{{ t.noCountrySub }}</div>
                    </div>
                  </sc-if>
                </div>
              </sc-if>

              <sc-if value="{{ obIsDone }}">
                <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 34px;text-align:center">
                  <div style="position:absolute;left:0;right:0;top:11%;height:150px;pointer-events:none;overflow:visible;opacity:.9">{{ obRoute }}</div>
                  <div style="position:relative;width:96px;height:96px;animation:nomLogoIn .9s cubic-bezier(.22,1,.36,1) both">
                    <div style="position:absolute;left:50%;top:50%;width:96px;height:96px;margin:-48px 0 0 -48px;border-radius:50%;border:2px solid var(--brand);animation:nomRipple 2.2s .35s ease-out infinite"></div>
                    <div style="position:absolute;left:50%;top:50%;width:96px;height:96px;margin:-48px 0 0 -48px;border-radius:50%;border:2px solid var(--brand);animation:nomRipple 2.2s 1.05s ease-out infinite"></div>
                    <div style="position:absolute;left:50%;top:50%;width:96px;height:96px;margin:-48px 0 0 -48px;border-radius:50%;border:2px solid var(--green);animation:nomRipple 2.2s 1.75s ease-out infinite"></div>
                    <div style="position:absolute;inset:0;border-radius:50%;background:var(--brandSoft);border:1px solid var(--line);display:flex;align-items:center;justify-content:center;font-size:31px;font-weight:800;letter-spacing:-.02em;color:var(--brand)">{{ obInitials }}</div>
                    <div style="position:absolute;right:-2px;bottom:-2px;width:32px;height:32px;border-radius:50%;background:var(--green);border:3px solid var(--bg);display:flex;align-items:center;justify-content:center">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FFF"><path d="M5 12.5l4.5 4.5L19 7" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </div>
                  </div>
                  <div style="margin-top:24px;font-size:27px;font-weight:800;letter-spacing:-.036em;line-height:1.15;color:var(--ink);text-wrap:pretty;animation:nomSoftUp .75s .3s cubic-bezier(.22,1,.36,1) both">{{ obWelcomeTitle }}</div>
                  <div style="margin-top:9px;font-size:14.5px;color:var(--ink2);animation:nomSoftUp .75s .42s cubic-bezier(.22,1,.36,1) both">{{ obWelcomeFlag }} {{ obWelcomeSub }}</div>
                  <div style="margin-top:22px;padding:15px 17px;border-radius:17px;background:var(--surface);border:1px solid var(--line);font-size:13px;line-height:1.55;color:var(--ink2);text-wrap:pretty;animation:nomSoftUp .75s .54s cubic-bezier(.22,1,.36,1) both">{{ t.doneNote }}</div>
                </div>
                <div style="padding:0 26px 32px;animation:nomSoftUp .75s .66s cubic-bezier(.22,1,.36,1) both">
                  <div onClick="{{ obFinish }}" role="button" tabIndex="0" style="height:56px;border-radius:18px;background:var(--brand);display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:var(--brandInk);cursor:pointer;box-shadow:var(--shadowLg)">{{ obDoneCta }}</div>
                </div>
              </sc-if>

              <sc-if value="{{ obIsForm }}">
                <div style="flex:0 0 auto;padding:14px 26px 30px;background:var(--bg)">
                  <div onClick="{{ obNext }}" role="button" tabIndex="0" style="{{ obNextCss }}">{{ obNextLabel }}</div>
                </div>
              </sc-if>

            </div>
          </sc-if>

        </div>
      </div>
    </div>
  </div>
`;

  /* ── Template runtime ──────────────────────────────────────────────────
     Only what this template actually uses: dotted-path interpolation in
     text and attributes, <sc-if>, <sc-for>, and the three event
     attributes. Expressions are plain paths — there is no expression
     language to implement. */

  var SVG_NS = 'http://www.w3.org/2000/svg';
  var EXPR = /\{\{\s*([\w$.]+)\s*\}\}/g;

  // Marks a string that is markup rather than text (badge SVG, confetti).
  function raw(html) { return { __raw: html }; }
  function isRaw(v) { return !!v && typeof v === 'object' && typeof v.__raw === 'string'; }

  function resolve(scope, path) {
    var parts = path.split('.');
    var cur = scope[parts[0]];
    for (var i = 1; i < parts.length && cur != null; i++) cur = cur[parts[i]];
    return cur;
  }

  // Whole-attribute expression, e.g. value="{{ hasQuery }}".
  function evalOne(src, scope) {
    var m = /^\s*\{\{\s*([\w$.]+)\s*\}\}\s*$/.exec(src || '');
    return m ? resolve(scope, m[1]) : src;
  }

  function interp(src, scope) {
    if (src.indexOf('{{') < 0) return src;
    return src.replace(EXPR, function (_, path) {
      var v = resolve(scope, path);
      return v == null ? '' : String(v);
    });
  }

  function parseRaw(html) {
    var t = document.createElement('template');
    t.innerHTML = html;
    return Array.prototype.slice.call(t.content.childNodes);
  }

  var tplContent = null;

  function prepareTemplate() {
    // Renamed before parsing so the browser never sees a real onclick
    // attribute holding template syntax.
    var src = TEMPLATE
      .replace(/ onClick="/g, ' data-on-click="')
      .replace(/ onChange="/g, ' data-on-input="')
      .replace(/ onKeyDown="/g, ' data-on-keydown="');
    var t = document.createElement('template');
    t.innerHTML = src;
    tplContent = t.content;
  }

  var handlers = [];

  function renderChildren(tplNode, scope, out) {
    var kids = tplNode.childNodes;
    for (var i = 0; i < kids.length; i++) renderNode(kids[i], scope, out);
  }

  function renderNode(node, scope, out) {
    if (node.nodeType === 3) {
      var text = node.nodeValue;
      if (text.indexOf('{{') < 0) { out.push(document.createTextNode(text)); return; }
      // A text node may hold markup values, so it can expand to several nodes.
      var last = 0;
      EXPR.lastIndex = 0;
      var m;
      while ((m = EXPR.exec(text)) !== null) {
        if (m.index > last) out.push(document.createTextNode(text.slice(last, m.index)));
        var v = resolve(scope, m[1]);
        if (isRaw(v)) parseRaw(v.__raw).forEach(function (n) { out.push(n); });
        else if (v != null && v !== '') out.push(document.createTextNode(String(v)));
        last = m.index + m[0].length;
      }
      if (last < text.length) out.push(document.createTextNode(text.slice(last)));
      return;
    }
    if (node.nodeType !== 1) return;

    var tag = node.localName;

    if (tag === 'sc-if') {
      if (evalOne(node.getAttribute('value'), scope)) renderChildren(node, scope, out);
      return;
    }

    if (tag === 'sc-for') {
      var list = evalOne(node.getAttribute('list'), scope);
      if (!list || !list.length) return;
      var as = node.getAttribute('as');
      for (var i = 0; i < list.length; i++) {
        var inner = Object.create(scope);
        inner[as] = list[i];
        renderChildren(node, inner, out);
      }
      return;
    }

    var isSvg = node.namespaceURI === SVG_NS;
    var el = isSvg ? document.createElementNS(SVG_NS, tag) : document.createElement(tag);
    var value = null;

    var attrs = node.attributes;
    for (var a = 0; a < attrs.length; a++) {
      var name = attrs[a].name, src = attrs[a].value;
      if (name.lastIndexOf('hint-placeholder', 0) === 0) continue;

      if (name === 'data-on-click' || name === 'data-on-input' || name === 'data-on-keydown') {
        var fn = evalOne(src, scope);
        if (typeof fn === 'function') {
          handlers.push(fn);
          el.setAttribute(name === 'data-on-click' ? 'data-h' : name === 'data-on-input' ? 'data-oi' : 'data-ok',
            String(handlers.length - 1));
        }
        continue;
      }
      if (name === 'ref') {
        var r = /\{\{\s*([\w$.]+)\s*\}\}/.exec(src);
        if (r) el.setAttribute('data-ref', r[1]);
        continue;
      }
      if (name === 'value' && (tag === 'input' || tag === 'textarea')) {
        value = interp(src, scope);
        continue;
      }
      el.setAttribute(name, interp(src, scope));
    }

    var kids = [];
    renderChildren(node, scope, kids);
    for (var k = 0; k < kids.length; k++) el.appendChild(kids[k]);
    if (value !== null) el.value = value;

    out.push(el);
  }

  /* ── DOM patching ─────────────────────────────────────────────────────
     Positional, unkeyed — the same identity rule React applies to lists
     rendered by index, which is what the design's templates do. */

  function sameNode(a, b) {
    if (a.nodeType !== b.nodeType) return false;
    if (a.nodeType !== 1) return true;
    return a.localName === b.localName && a.namespaceURI === b.namespaceURI;
  }

  function patch(oldNode, newNode) {
    if (oldNode.nodeType !== 1) {
      if (oldNode.nodeValue !== newNode.nodeValue) oldNode.nodeValue = newNode.nodeValue;
      return;
    }

    /* data-keep means another library owns this element — Leaflet, for the
       map container. Leave it alone completely, attributes included: the
       attribute sync below deletes anything the template does not name, and
       it was stripping the `leaflet-container` class and `tabindex` Leaflet
       puts on the container the moment anything else re-rendered. That class
       carries Leaflet's own overflow, cursor and touch-action rules, so the
       map lost them on the first state change after it mounted. Nothing in
       the template's attributes for this node varies anyway. */
    if (oldNode.hasAttribute('data-keep')) return;

    var na = newNode.attributes, i;
    for (i = 0; i < na.length; i++) {
      if (oldNode.getAttribute(na[i].name) !== na[i].value) oldNode.setAttribute(na[i].name, na[i].value);
    }
    var oa = oldNode.attributes;
    for (i = oa.length - 1; i >= 0; i--) {
      if (!newNode.hasAttribute(oa[i].name)) oldNode.removeAttribute(oa[i].name);
    }

    // Assigning unconditionally would drop the caret to the end mid-typing.
    var tag = oldNode.localName;
    if ((tag === 'input' || tag === 'textarea') && oldNode.value !== newNode.value) {
      oldNode.value = newNode.value;
    }

    // <image-slot> paints its own contents on connect, so a freshly rendered
    // one is still empty. Morphing its children would delete the painted
    // image — including a photo the user dropped. Sync attributes and let the
    // component repaint itself through attributeChangedCallback.
    if (tag === 'image-slot') return;

    morph(oldNode, Array.prototype.slice.call(newNode.childNodes));
  }

  function morph(parent, newNodes) {
    var i;
    for (i = 0; i < newNodes.length; i++) {
      var incoming = newNodes[i];
      var existing = parent.childNodes[i];
      if (!existing) { parent.appendChild(incoming); continue; }
      if (!sameNode(existing, incoming)) { parent.replaceChild(incoming, existing); continue; }
      patch(existing, incoming);
    }
    while (parent.childNodes.length > newNodes.length) parent.removeChild(parent.lastChild);
  }

  /* ── State ────────────────────────────────────────────────────────────
     `platform` is state here; in the design it was a canvas prop. */

  var state = {
    screen: 'home',
    stack: [],
    theme: 'light',
    platform: 'iOS',
    first: 'Alex',
    profile: null,
    userTrips: [],
    onboarding: false,
    obEditing: false,
    // When set, only this one step is shown — Profile edits one field.
    obOnly: null,
    obExiting: false,
    obStep: 0,
    obFirst: '',
    obLast: '',
    obCountry: '',
    obLang: 'en',
    obQuery: '',
    placeId: 1,
    filter: 'All',
    mapFilter: 'All',
    // No pin is chosen until one is tapped, so the map opens showing the
    // country rather than a card for a place nobody asked about.
    mapPin: null,
    favs: [1, 11],
    chat: [],
    typing: false,
    itinDay: 1,
    celebrate: null,
    celebN: 0,
    chalKind: 'gourmet',
    taskIdx: 0,
    proofAlt: null,
    checking: false,
    reviewStars: 0,
    reviewText: '',
    reviews: {},
    searchQuery: '',
    // What the last real route or location attempt reported, shown on the map.
    routeNote: '',
    // place id -> { loading, ok, stops, error } from 2GIS
    transport: {},
    // place id -> { loading, ok, branches, total } — every branch of the chain
    orgBranches: {},
    // the branch address just tapped, so the map can mark it
    activeBranch: null,
    toast: '',
    chatInput: '',
    speaking: null,
    phraseCat: 'hello',
    amount: '100',
    curCode: 'USD',
    curPicking: false,
    proofs: {
      gourmet: { 0: 'ok', 1: 'ok', 2: 'ok', 3: 'ok', 4: 'ok' },
      coffee: { 0: 'ok', 1: 'ok', 2: 'ok', 3: 'ok', 4: 'ok' },
      smart: { 0: 'ok', 1: 'ok', 2: 'ok', 3: 'ok' },
      nature: { 0: 'ok' },
      history: {},
      photo: { 0: 'ok', 1: 'ok' }
    }
  };

  var scheduled = false;
  var pendingCallbacks = [];

  function setState(patchOrFn, cb) {
    var next = typeof patchOrFn === 'function' ? patchOrFn(state) : patchOrFn;
    if (next) for (var k in next) if (Object.prototype.hasOwnProperty.call(next, k)) state[k] = next[k];
    if (cb) pendingCallbacks.push(cb);
    if (scheduled) return;
    scheduled = true;
    // Batches the several setState calls a single interaction can make.
    Promise.resolve().then(function () {
      scheduled = false;
      draw();
      var run = pendingCallbacks;
      pendingCallbacks = [];
      run.forEach(function (f) { f(); });
    });
  }

  /* ── Behaviour ───────────────────────────────────────────────────────── */

  function go(s) { setState(function (st) { return { screen: s, stack: st.stack.concat([st.screen]) }; }); }
  function jump(s) { setState({ screen: s, stack: [] }); }
  function back() {
    setState(function (st) {
      if (!st.stack.length) return { screen: 'home' };
      var stack = st.stack.slice();
      return { screen: stack.pop(), stack: stack };
    });
  }
  function openPlace(id) {
    setState(function (st) { return { placeId: id, screen: 'place', stack: st.stack.concat([st.screen]) }; });
  }
  function byName(n) {
    var p = D.places.filter(function (x) { return x.name === n; })[0];
    if (p) openPlace(p.id);
  }
  function toggleFav(id, e) {
    if (e && e.stopPropagation) e.stopPropagation();
    setState(function (st) {
      return { favs: st.favs.indexOf(id) >= 0 ? st.favs.filter(function (x) { return x !== id; }) : st.favs.concat([id]) };
    });
  }

  // Weighted keyword match: a hit on "how many days" should beat a stray hit
  // on "days", so each match scores by its own length rather than counting 1.
  function matchIntent(q) {
    var t = ' ' + q.toLowerCase().replace(/[^a-zа-яё0-9-]+/gi, ' ') + ' ';
    var best = null, bestScore = 0;
    D.intents.forEach(function (it) {
      var score = 0;
      it.k.forEach(function (k) {
        if (t.indexOf(' ' + k) >= 0) score += k.length + 2;
      });
      // An exact question match outranks everything.
      if (t.indexOf(' ' + it.q.toLowerCase().replace(/[^a-z0-9 ]/g, '') + ' ') >= 0) score += 100;
      if (score > bestScore) { bestScore = score; best = it.q; }
    });
    return bestScore > 0 ? best : null;
  }

  /* The written answers this app shipped with. They are no longer the
     assistant — they are what it says when it cannot reach Gemini, so the
     prototype still answers on a plane or behind a blocked network. */
  function cannedAnswer(query) {
    var key = D.answers[query] ? query : matchIntent(query);
    var a = (key && D.answers[key]) || null;
    var L = uiLang();
    return {
      key: key,
      body: a ? aiOf(key, 'text', a.text) : ((L !== 'en' && D.fallbackText[L]) || D.fallbackAnswer),
      chips: (a && a.chips) || [],
      itin: !!(a && a.itin)
    };
  }

  /** Why the real assistant could not answer, in one line the user can act on. */
  function offlineNote(reason, detail) {
    if (reason === 'nokey') return 'Offline answer — add a Gemini key to get live ones.';
    if (reason === 'quota') return 'Offline answer — the Gemini key is out of free quota for today.';
    if (reason === 'badkey') return 'Offline answer — Google rejected that Gemini key.';
    return 'Offline answer — could not reach Gemini' + (detail ? ' (' + detail + ')' : '') + '.';
  }

  /**
   * Ask for the key once, the first time someone uses the assistant without
   * one. It is stored in this browser only — never in a file, because every
   * file here is downloadable by anyone who opens the app.
   */
  var keyAsked = false;
  function promptForKey(retryQuestion) {
    if (keyAsked || !ENG) return;
    keyAsked = true;
    setTimeout(function () {
      var k = window.prompt(
        'Paste a Gemini API key to turn on the live assistant.\n\n' +
        'Get one free at aistudio.google.com/apikey\n' +
        'It is saved in this browser only. Leave empty to keep using offline answers.'
      );
      if (k && k.trim()) {
        ENG.setApiKey(k);
        if (retryQuestion) ask(retryQuestion);
      }
    }, 300);
  }

  function ask(q) {
    var query = (q || '').trim();
    if (!query) return;

    var canned = cannedAnswer(query);
    var shown = canned.key ? aiOf(canned.key, 'q', query) : query;

    setState(function (st) {
      return { chat: st.chat.concat([{ who: 'me', text: shown }]), typing: true, chatInput: '' };
    });

    if (!ENG) {
      // Engine missing entirely (a file failed to load) — behave as before.
      setTimeout(function () {
        setState(function (st) {
          return { typing: false, chat: st.chat.concat([{ who: 'ai', text: canned.body, chips: canned.chips, itin: canned.itin }]) };
        });
      }, 400);
      return;
    }

    ENG.ask(query, function (res) {
      setState(function (st) {
        var msg;
        if (res.offline) {
          // Fall back to the written answer, and say why it is not the live one
          // rather than passing an offline reply off as the assistant's.
          msg = {
            who: 'ai',
            text: canned.body,
            chips: canned.chips,
            itin: canned.itin,
            note: offlineNote(res.reason, res.detail)
          };
          /* A rejected key needs replacing, same as a missing one, so both
             open the prompt rather than only explaining the problem. */
          if (res.reason === 'nokey' || res.reason === 'badkey') promptForKey(query);
        } else {
          msg = {
            who: 'ai',
            text: res.text,
            /* The engine hands back the whole row for every place the answer
               cited — photograph, rating, category, distance, coordinates.
               Only the name was kept, so an answer about Ala-Archa left the
               reader a word to tap and nothing to look at. The rows are
               carried through now and drawn as cards.

               `chips` stays for the offline answers, which have names and
               no rows behind them. */
            cards: res.places || [],
            chips: [],
            itin: false
          };
        }
        return { typing: false, chat: st.chat.concat([msg]) };
      });
    });
  }

  function sendChat() { ask(state.chatInput); }
  function chatKey(e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(); } }

  var clipEl = null;

  function stopAudio() {
    if (clipEl) { clipEl.pause(); clipEl.onended = null; clipEl.onerror = null; clipEl = null; }
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  }

  // A recorded clip wins; a phrase without one falls back to the device
  // voice, which reads Cyrillic with a Russian accent — close enough to be
  // useful.
  function speak(item) {
    var wasPlaying = state.speaking === item.id;
    stopAudio();
    if (wasPlaying) { setState({ speaking: null }); return; }

    var clear = function () { setState(function (st) { return st.speaking === item.id ? { speaking: null } : null; }); };
    var src = D.phraseAudio[item.id];

    if (src) {
      var el = new Audio(src);
      clipEl = el;
      el.onended = clear;
      el.onerror = clear;

      /* Seek past the room tone the recordings open with — about a second
         of it, which played as silence and read as a broken button. The
         offsets are measured per clip in phrase-audio.js.

         The seek has to wait for enough of the clip to be readable;
         setting currentTime before then is silently ignored. */
      var lead = (window.NOMAD_PHRASE_LEADIN || {})[item.id] || 0;
      if (lead > 0) {
        var seek = function () {
          try { if (el.currentTime < lead) el.currentTime = lead; } catch (e) { /* not seekable yet */ }
        };
        if (el.readyState >= 1) seek();
        else el.addEventListener('loadedmetadata', seek, { once: true });
      }

      setState({ speaking: item.id });
      var p = el.play();
      if (p && p.catch) p.catch(clear);
      return;
    }

    var synth = window.speechSynthesis;
    if (!synth || typeof SpeechSynthesisUtterance === 'undefined') return;
    var u = new SpeechSynthesisUtterance(item.ky);
    var v = (synth.getVoices() || []).filter(function (x) { return /^(ky|kk|ru)/i.test(x.lang); })[0];
    if (v) { u.voice = v; u.lang = v.lang; } else { u.lang = 'ru-RU'; }
    u.rate = 0.82;
    u.onend = clear;
    u.onerror = clear;
    setState({ speaking: item.id });
    synth.speak(u);
  }

  var celebTimer = null;
  function runCeleb(kind) {
    var b = chalOf(kind);
    if (!b) return;
    setState({ celebrate: kind, celebN: 0 });
    if (celebTimer) clearInterval(celebTimer);
    var t = 0;
    celebTimer = setInterval(function () {
      t += 1;
      var p = Math.min(1, t / 24);
      setState({ celebN: Math.round(b.xp * (1 - Math.pow(1 - p, 3))) });
      if (p >= 1) { clearInterval(celebTimer); celebTimer = null; }
    }, 34);
  }

  function verifiedCount(kind) { return Object.keys(state.proofs[kind] || {}).length; }
  function chalOf(kind) { return D.badgeList.filter(function (b) { return b.kind === kind; })[0]; }
  function isEarned(kind) { return verifiedCount(kind) === chalOf(kind).tasks.length; }

  function openChallenge(kind) {
    setState(function (st) {
      return { chalKind: kind, taskIdx: 0, proofAlt: null, screen: 'challenge', stack: st.stack.concat([st.screen]) };
    });
  }
  function openVerify(i, e) {
    if (e && e.stopPropagation) e.stopPropagation();
    setState(function (st) {
      return { taskIdx: i, screen: 'verify', checking: false, proofAlt: null, stack: st.stack.concat([st.screen]) };
    });
  }
  // taskIdx belongs to whichever challenge was last open, so it can point
  // past the end of a shorter one — always read the task through here.
  function taskOf(st) { var t = chalOf(st.chalKind).tasks; return t[st.taskIdx] || t[0]; }
  function proofOf(st) { return st.proofAlt || taskOf(st).proof; }
  function pickProof(kind) { setState({ proofAlt: kind }); }

  function submitProof() {
    setState({ checking: true });
    setTimeout(function () {
      var completed = null;
      setState(function (st) {
        var tasks = chalOf(st.chalKind).tasks;
        var idx = st.taskIdx < tasks.length ? st.taskIdx : 0;
        var p = Object.assign({}, st.proofs);
        p[st.chalKind] = Object.assign({}, p[st.chalKind] || {});
        p[st.chalKind][idx] = 'ok';
        if (Object.keys(p[st.chalKind]).length === tasks.length) completed = st.chalKind;
        return { proofs: p, checking: false, proofAlt: null, screen: 'challenge', stack: st.stack.slice(0, -1) };
      }, function () {
        if (completed) setTimeout(function () { runCeleb(completed); }, 340);
      });
    }, 1500);
  }

  function earnedXp() {
    return D.badgeList.reduce(function (sum, b) {
      return sum + Math.round((b.xp / b.tasks.length) * verifiedCount(b.kind));
    }, D.BASE_XP);
  }

  function levelOf(xp) {
    var i = 0;
    while (i + 1 < D.levels.length && xp >= D.levels[i + 1][0]) i += 1;
    var floor = D.levels[i][0];
    var next = D.levels[i + 1] || null;
    return {
      n: i + 1, name: D.levels[i][1], next: next ? next[1] : null,
      toNext: next ? next[0] - xp : 0,
      pct: next ? Math.max(0, Math.min(1, (xp - floor) / (next[0] - floor))) : 1
    };
  }

  function seedReviews(place) {
    var r = D.reviewers[place.id % D.reviewers.length];
    return [{
      who: r[0], from: r[1], when: D.reviewAges[place.id % D.reviewAges.length],
      stars: place.rating >= 4.7 ? 5 : 4, text: placeReviewOf(place), verified: true
    }];
  }
  function reviewsFor(place) { return (state.reviews[place.id] || []).concat(seedReviews(place)); }

  function postReview(place) {
    if (!state.reviewStars) return;
    var text = state.reviewText.trim() || 'Went on the strength of the app and it was right.';
    var me = activeProfile();
    setState(function (s2) {
      var all = Object.assign({}, s2.reviews);
      all[place.id] = [{ who: (me.first + ' ' + me.last).trim(), from: me.country, when: 'just now', stars: s2.reviewStars, text: text, verified: true }]
        .concat(all[place.id] || []);
      return { reviews: all, screen: 'place', stack: s2.stack.slice(0, -1), reviewStars: 0, reviewText: '' };
    });
  }

  function fmt(n) { return n.toLocaleString('en-US').replace(/,/g, ' '); }

  function chipCss(on) {
    return 'flex:0 0 auto;white-space:nowrap;padding:9px 15px;border-radius:99px;font-size:13px;font-weight:600;cursor:pointer;transition:all .16s;border:1px solid ' +
      (on ? 'transparent;background:var(--ink);color:var(--bg)' : 'var(--line);background:var(--surface);color:var(--ink2)');
  }
  function tabCss(on) {
    return 'display:flex;flex-direction:column;align-items:center;gap:5px;padding:6px 0;cursor:pointer;transition:color .16s;color:' +
      (on ? 'var(--brand)' : 'var(--ink3)');
  }

  /* ── Localised place content ──────────────────────────────────────────
     Place names stay as they are — they are proper nouns and you have to
     say them out loud to a taxi driver. Everything written about a place
     follows the interface language. */

  function uiLang() {
    var p = state.profile;
    return state.onboarding ? state.obLang : ((p && p.lang) || 'en');
  }
  function catOf(cat) {
    var L = uiLang();
    return (L !== 'en' && D.catNames[L] && D.catNames[L][cat]) || cat;
  }
  function listTitleOf(title) {
    var L = uiLang();
    return (L !== 'en' && D.listTitles[L] && D.listTitles[L][title]) || title;
  }
  // Distances, hours, travel times and prices are formulaic, so they are
  // localised by substituting fragments rather than storing every variant.
  function micro(str) {
    var L = uiLang();
    if (L === 'en' || !str) return str;
    var terms = D.microTerms[L] || [];
    var out = String(str);
    // Kyrgyz puts "чейин" after the time, not before it
    if (L === 'ky') out = out.replace(/^till (.+)$/, '$1 чейин');
    for (var i = 0; i < terms.length; i++) {
      if (out.indexOf(terms[i][0]) >= 0) out = out.split(terms[i][0]).join(terms[i][1]);
    }
    return out;
  }
  function descOf(p) {
    var L = uiLang(), t = D.placeText[p.id];
    return (L !== 'en' && t && t[L] && t[L].desc) || p.desc;
  }
  function placeReviewOf(p) {
    var L = uiLang(), t = D.placeText[p.id];
    return (L !== 'en' && t && t[L] && t[L].review) || p.review;
  }

  // Dish chips, badge tasks, trip names and filter labels.
  // The assistant answers in the interface language; matching still runs on the
  // English keyword set, so a question typed in any language routes the same.
  function aiOf(key, field, fallback) {
    var L = uiLang(), g = D.aiText[L] && D.aiText[L][key];
    return (g && g[field]) || fallback;
  }

  function term(group, value) {
    var L = uiLang(), g = D.termText[L] && D.termText[L][group];
    return (g && g[value]) || value;
  }
  // Country names come from the browser for Russian; Kyrgyz has no CLDR data
  // here, so a table covers the common origins and the rest stay English.
  var regionNames = {};
  function countryName(code, english) {
    var L = uiLang();
    if (L === 'ky') return (D.kyCountries[code] || english);
    if (L !== 'ru') return english;
    if (code === 'KG') return 'Кыргызстан';        // not the Soviet-era exonym
    try {
      if (!regionNames.ru) regionNames.ru = new Intl.DisplayNames(['ru'], { type: 'region' });
      return regionNames.ru.of(code) || english;
    } catch (e) { return english; }
  }
  function countryLabelOf(name) {
    var c = countryByName(name);
    return c ? countryName(c[0], name) : name;
  }

  function moreOf(group, key, fallback) {
    var L = uiLang(), g = D.moreText[L] && D.moreText[L][group];
    return (g && g[key]) || fallback;
  }

  function badgeNameOf(kind) {
    var L = uiLang(), b = chalOf(kind);
    var t = D.badgeText[L] && D.badgeText[L][kind];
    return (t && t.name) || b.name;
  }
  function badgeSubOf(kind) {
    var L = uiLang(), b = chalOf(kind);
    var t = D.badgeText[L] && D.badgeText[L][kind];
    return (t && t.sub) || b.sub;
  }
  function proofOfKind(k, field) {
    var L = uiLang(), t = D.proofText[L] && D.proofText[L][k];
    return (t && t[field]) || D.proofKinds[k][field];
  }

  function card(p) {
    return {
      name: p.name, cat: catOf(p.cat), rating: p.rating.toFixed(1), dist: micro(p.dist), price: micro(p.price),
      slot: p.slot, ph: p.ph,
      go: function () { openPlace(p.id); },
      fav: function (e) { toggleFav(p.id, e); },
      heart: state.favs.indexOf(p.id) >= 0 ? '#A03D4E' : 'none'
    };
  }

  function badgeArt(kind, size, locked) { return raw(window.badgeArt(kind, size, locked)); }

  /* ── Brand mark ───────────────────────────────────────────────────────
     The real logo, not a redraw. logo-mark.png and logo-word.png are alpha
     silhouettes cut from logo.png (the supplied artwork), so painting them
     as CSS masks lets the mark take var(--ink) and stay legible in dark
     mode instead of sitting on its own cream rectangle. */
  // A plain <img> with a transparent PNG — no mask, no coloured box behind it.
  // The artwork itself carries the colour, in a light and a dark variant.
  function logoImg(base, w, h, label) {
    var tone = state.theme === 'dark' ? 'cream' : 'ink';
    return '<img src="' + base + '-' + tone + '.png" alt="' + label + '" width="' + w + '" height="' + h +
      '" style="width:' + w + 'px;height:' + h + 'px;display:block;object-fit:contain">';
  }
  function logoMarkHtml(size) {
    return logoImg('logo-mark', size, Math.round(size * 155 / 151), 'Nomadai');
  }
  function logoWordHtml(width) {
    return logoImg('logo-word', width, Math.round(width * 36 / 263), 'NOMADAI');
  }

  /* ── Profile & onboarding ─────────────────────────────────────────────
     The design shipped a hardcoded "Alex K. from Poland". A real first run
     asks instead, keeps the answer on the device, and never asks again. */

  var PROFILE_KEY = 'nomad.profile.v1';

  function loadProfile() {
    try {
      var p = JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null');
      return p && p.first ? p : null;
    } catch (e) { return null; }
  }
  function saveProfile(p) {
    try { localStorage.setItem(PROFILE_KEY, JSON.stringify(p)); } catch (e) { /* private mode — this session only */ }
  }

  // Windows has no glyphs for regional-indicator flag emoji — they render as
  // two letter boxes — so flags are real images.
  function flagImg(code, w) {
    var width = w || 26;
    return '<img src="img/flags/' + code.toLowerCase() + '.svg" alt="' + code + '" width="' + width +
      '" style="width:' + width + 'px;height:' + Math.round(width * 0.68) + 'px;object-fit:cover;' +
      'border-radius:3px;display:inline-block;vertical-align:-3px;flex:0 0 auto;' +
      'box-shadow:0 0 0 1px rgba(27,20,17,.10)" loading="lazy">';
  }
  function flagOf(code, w) { return raw(flagImg(code, w)); }
  function countryByName(name) {
    return D.countries.filter(function (c) { return c[1] === name; })[0] || null;
  }
  function initialsOf(p) {
    var a = (p.first || '').trim(), b = (p.last || '').trim();
    if (a && b) return (a[0] + b[0]).toUpperCase();
    if (a) return a.slice(0, 2).toUpperCase();
    return 'NA';
  }

  // Falls back to the prototype's demo identity so the app still reads well
  // if onboarding was never completed.
  function activeProfile() {
    return state.profile && state.profile.first
      ? state.profile
      : { first: 'Alex', last: 'K.', country: 'Poland', lang: 'en' };
  }
  function langOf(code) {
    return D.languages.filter(function (l) { return l.code === code; })[0] || D.languages[0];
  }
  function tr(code) { return D.strings[code] || D.strings.en; }

  var OB_SPLASH = 0, OB_LANG = 1, OB_NAME = 2, OB_COUNTRY = 3, OB_DONE = 4;

  function obNext() {
    var step = state.obStep;
    if (step === OB_NAME && !state.obFirst.trim()) return;
    if (step === OB_COUNTRY && !state.obCountry) return;
    // Editing an existing profile saves straight away — the welcome screen
    // is only meaningful the first time.
    if (state.obOnly !== null) { obFinish(); return; }
    if (step === OB_COUNTRY && state.obEditing) { obFinish(); return; }
    setState({ obStep: step + 1 });
  }
  function obBack() {
    // Back out of the first step means "cancel" when editing, rather than
    // dropping the user onto an intro splash they have already seen.
    if (state.obOnly !== null || (state.obStep === OB_LANG && state.obEditing)) {
      setState({ onboarding: false, obEditing: false, obOnly: null });
      return;
    }
    setState(function (st) { return { obStep: Math.max(OB_SPLASH, st.obStep - 1) }; });
  }
  function obKeyDown(e) {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    if (state.obStep === OB_COUNTRY) {
      var list = filteredCountries();
      if (!state.obCountry && list.length) { setState({ obCountry: list[0][1], obQuery: '' }); return; }
    }
    obNext();
  }
  function obPick(name) {
    setState({ obCountry: name, obQuery: '' });
  }
  // Saving commits immediately so the screen underneath is already correct;
  // the overlay then dissolves over it rather than being cut away.
  function obFinish() {
    if (state.obExiting) return;
    var p = {
      first: state.obFirst.trim(), last: state.obLast.trim(),
      country: state.obCountry, lang: state.obLang
    };
    saveProfile(p);
    setState({ profile: p, first: p.first, obEditing: false, obExiting: true });
    setTimeout(function () {
      setState({ onboarding: false, obExiting: false, obOnly: null, obStep: OB_SPLASH });
    }, 460);
  }
  // Re-entered from Profile → the row the design left inert.
  /* Editing one field from Profile shows that field and nothing else.
     It used to reopen the whole three-step intro at the step asked for, so
     choosing Language landed on "Step 1 of 3" with Continue leading to name
     and country — a five-tap detour to change one setting. `obOnly` marks
     the single-field case: no step counter, no progress dots, and the
     button saves instead of continuing. */
  function openProfileEdit(step) {
    var p = activeProfile();
    setState({
      onboarding: true, obEditing: true, obOnly: step || OB_LANG, obStep: step || OB_LANG,
      obFirst: p.first, obLast: p.last, obCountry: p.country,
      obLang: p.lang || 'en', obQuery: ''
    });
  }
  function obPickLang(code) { setState({ obLang: code }); }

  // Reachable from the nav bar, so seeing the intro never needs a URL flag.
  function replayIntro() {
    // Prefill only from a profile the user actually saved — falling back to
    // the prototype's demo identity would put "Alex K." in their name field.
    var p = state.profile && state.profile.first ? state.profile : null;
    setState({
      onboarding: true, obEditing: false, obOnly: null, obExiting: false, obStep: OB_SPLASH,
      obFirst: p ? p.first : '', obLast: p ? p.last : '',
      obCountry: p ? p.country : '', obLang: p ? (p.lang || 'en') : 'en', obQuery: ''
    });
  }
  function newProfile() {
    try { localStorage.removeItem(PROFILE_KEY); } catch (e) { /* nothing stored */ }
    setState({
      profile: null, onboarding: true, obEditing: false, obOnly: null, obExiting: false, obStep: OB_SPLASH,
      obFirst: '', obLast: '', obCountry: '', obLang: 'en', obQuery: ''
    });
  }

  /* ── Category colour ──────────────────────────────────────────────────
     The engine owns the palette so the pin on the map and the dot on a card
     can never drift apart. */

  function catColourOf(cat) {
    return (ENG && ENG.catColour) ? ENG.catColour(cat) : { fill: '#A03D4E', ring: '#6E2734' };
  }

  /** A small filled circle in the category's colour. */
  function catDotCss(cat, size, hollow) {
    var c = catColourOf(cat);
    return 'display:inline-block;flex:0 0 ' + size + 'px;width:' + size + 'px;height:' + size +
      'px;border-radius:50%;background:' + (hollow ? 'var(--surface)' : c.fill) +
      ';border:' + (hollow ? '2.5px' : '1.5px') + ' solid ' + c.ring + ';box-sizing:border-box';
  }

  /** The category pill on the place screen, tinted to match its pin. */
  function catChipCss(cat) {
    var c = catColourOf(cat);
    return 'display:inline-flex;align-items:center;gap:7px;padding:6px 12px;border-radius:99px;' +
      'background:' + c.fill + '1F;font-size:11.5px;font-weight:700;letter-spacing:.02em;color:' + c.ring;
  }

  /* ── Public transport ─────────────────────────────────────────────────
     Bishkek's marshrutkas are gone. Rather than swap one hand-written
     paragraph for another that will also age, the stops near a place and
     the routes calling at them are read from 2GIS when the place opens. */

  var TR = window.Nomad2GIS || null;

  /** Ask for the stops around a place, once, and re-render when they land. */
  function loadTransport(p) {
    if (!TR || !TR.enabled() || !p || typeof p.lat !== 'number') return;
    var id = p.id;
    if (state.transport[id]) return;                 // already have it or asking
    setState(function (st) {
      var next = Object.assign({}, st.transport);
      next[id] = { loading: true };
      return { transport: next };
    });
    TR.stopsNear(p.lat, p.lng, function (res) {
      setState(function (st) {
        var next = Object.assign({}, st.transport);
        next[id] = { loading: false, ok: res.ok, stops: res.stops || [], error: res.error };
        return { transport: next };
      });
    });
  }

  /**
   * Ask 2GIS for every branch of the business at `p`, once per language.
   *
   * Addresses come back in the reader's language — Kyrgyz and Russian from
   * 2GIS directly, English transliterated, since 2GIS has no English for
   * Kyrgyzstan. Keying the cache by language means switching it re-asks
   * rather than leaving Cyrillic on an English screen.
   */
  function loadBranches(p) {
    if (!TR || !TR.enabled() || !p || typeof p.lat !== 'number') return;
    var lang = uiLang();
    var key = p.id + ':' + lang;
    if (state.orgBranches[key]) return;
    setState(function (st) {
      var next = Object.assign({}, st.orgBranches);
      next[key] = { loading: true };
      return { orgBranches: next };
    });
    TR.branchesOf(p, lang, function (res) {
      setState(function (st) {
        var next = Object.assign({}, st.orgBranches);
        next[key] = { loading: false, ok: res.ok, branches: res.branches || [], total: res.total || 0 };
        return { orgBranches: next };
      });
    });
  }

  /** Whatever branches we hold for this place in the current language. */
  function branchEntry(p) {
    return p ? state.orgBranches[p.id + ':' + uiLang()] : null;
  }

  /* ── Chain branches ───────────────────────────────────────────────────
     nomad-branches.js carries the locations the bot listed as text. */

  /**
   * Every branch of a place.
   *
   * 2GIS is the source when it has matched the business — it knows far
   * more chains than the two the bot happened to spell out, and its
   * coordinates are the real shopfronts rather than geocoded street
   * addresses. nomad-branches.js remains the fallback for those two, so
   * the app still shows them with no key or no network.
   */
  function placeBranches(p) {
    if (!p) return [];
    var live = branchEntry(p);
    if (live && live.ok && live.branches.length) {
      // The one this screen is about is not an "other branch".
      return live.branches.filter(function (b) { return !b.isThisOne; });
    }
    return (ENG && ENG.branchesOf) ? ENG.branchesOf(p.id) : [];
  }

  /**
   * The address line for a place.
   *
   * A chain's `addr` is the whole branch list — "Сеть кофеен, филиалы:\n•
   * Уметалиева 74\n• …" — which the address row rendered as one squashed
   * run-on. The branches have their own section now, so only the chain's
   * own description is kept here.
   */
  function addrOf(p) {
    var addr = (p && p.addr) || '';
    if (!placeBranches(p).length) return addr;
    return addr.split('\n')[0].replace(/[,\s]*(филиалы|branches)\s*:?\s*$/i, '').trim() || addr;
  }

  /**
   * How far a branch is.
   *
   * From the traveller when their position is known. Otherwise from the
   * branch they are reading about, which is what 2GIS measured and reads
   * naturally under a heading of "other branches" — the alternative was a
   * list with no distances at all whenever location is off.
   */
  function branchDistance(b) {
    if (ENG && ENG.position()) {
      return ENG.formatKm(ENG.distanceKm(ENG.position(), { lat: b.lat, lng: b.lng }));
    }
    if (typeof b.metres === 'number' && ENG) return ENG.formatKm(b.metres / 1000);
    return '';
  }

  /** Open the map on one place, pin selected and card open. */
  function showOnMap(place) {
    if (!place || typeof place.lat !== 'number') return;
    setState(function (st) {
      return { screen: 'map', mapPin: place.id, mapFilter: 'All', routeNote: '',
        activeBranch: null, stack: st.stack.concat([st.screen]) };
    });
    if (ENG) ENG.drawRoute(null);
    lastMapFit = null;
    // Once the map has mounted; centring before that lands on nothing.
    setTimeout(function () { if (ENG) ENG.focusPlace(place.id); }, 260);
  }

  /** Open the map on the chain, centred on the branch that was tapped. */
  function showBranchOnMap(place, branch) {
    setState(function (st) {
      return { screen: 'map', mapPin: place.id, mapFilter: 'All', routeNote: '',
        activeBranch: branch.addr, stack: st.stack.concat([st.screen]) };
    });
    if (ENG) ENG.drawRoute(null);
    lastMapFit = null;
    // After the map has mounted and the branch rings are drawn.
    setTimeout(function () { if (ENG) ENG.panTo(branch.lat, branch.lng); }, 260);
  }

  /* ── Toast ────────────────────────────────────────────────────────────
     One line, bottom of the phone, gone after a few seconds. Used where an
     action leaves the app and the browser gives no sign it worked. */

  var toastTimer = null;
  function toast(msg, ms) {
    if (toastTimer) { clearTimeout(toastTimer); toastTimer = null; }
    setState({ toast: msg });
    toastTimer = setTimeout(function () {
      toastTimer = null;
      setState({ toast: '' });
    }, ms || 4200);
  }

  /* ── Support desk ─────────────────────────────────────────────────────
     Whoever runs this app, reachable from the Emergency screen. Every
     channel is optional and driven by nomad-config.js, so nothing here
     invents a contact detail — an unstaffed number on an emergency screen
     is worse than no number at all. */

  function supportCfg() { return (window.NOMAD_CONFIG && window.NOMAD_CONFIG.support) || {}; }

  /**
   * Hand off to another app — WhatsApp, the mail client, Telegram.
   *
   * A straight assignment rather than window.open: on a phone that is what
   * makes the handset switch to WhatsApp immediately instead of opening a
   * browser tab that then has to redirect. The app is a single page held in
   * localStorage, so coming back lands exactly where it left off.
   */
  function openExternal(url) {
    window.location.href = url;
  }

  function waLink(number) {
    // wa.me wants digits only — a +, a space or a dash and the link dies.
    return 'https://wa.me/' + String(number).replace(/\D/g, '');
  }

  /**
   * Start an email to the support desk.
   *
   * `mailto:` only goes anywhere if the device has a mail client registered
   * for it. On a desktop browser with none — which is most of them now —
   * the link is silently ignored and the button looks broken. There is no
   * way to detect that, so this does not rely on it: the address goes to
   * the clipboard and is named in a toast either way, and the traveller
   * ends up holding it whatever their machine does with the link.
   */
  function emailSupport(address, t) {
    var url = 'mailto:' + address + '?subject=' + encodeURIComponent('Nomad AI — help');
    try { window.location.href = url; } catch (e) { /* no handler — the toast carries it */ }
    copyText(address, function (copied) {
      toast(copied ? t.supportEmailCopied.replace('{email}', address)
                   : t.supportEmailIs.replace('{email}', address), 7000);
    });
  }

  /** The desk's numbers, each offering WhatsApp and a plain call. */
  function supportNumbers(t) {
    var s = supportCfg();
    return (s.numbers || []).filter(function (n) { return n && (n.whatsapp || n.dial); })
      .map(function (n) {
        return {
          label: n.label || n.dial,
          hasWhatsapp: !!n.whatsapp,
          waLabel: 'Message support on WhatsApp at ' + (n.label || n.dial),
          callLabel: 'Call support on ' + (n.label || n.dial),
          wa: function (e) {
            if (e && e.stopPropagation) e.stopPropagation();
            openExternal(waLink(n.whatsapp));
          },
          call: function (e) {
            if (e && e.stopPropagation) e.stopPropagation();
            callNumber(n.dial || n.label, t.supportName);
          }
        };
      });
  }

  /** Everything that is not a phone number: email, Telegram, the assistant. */
  function supportChannels(t) {
    var s = supportCfg();
    var list = [];

    if (s.telegram) {
      list.push({ key: 'telegram', name: 'Telegram', icon: '✈', label: 'Message support on Telegram',
        go: function () { openExternal('https://t.me/' + String(s.telegram).replace(/^@/, '')); } });
    }
    if (s.email) {
      list.push({ key: 'email', name: t.supportEmail, icon: '✉', label: 'Email support at ' + s.email,
        go: function () { emailSupport(s.email, t); } });
    }

    /* Always last, always present: it needs nothing configured, and with no
       desk set up at all it is the only thing here that can help. */
    list.push({
      key: 'ai', name: t.supportAsk, icon: '✦', label: 'Ask the assistant for help',
      go: function () { jump('ai'); }
    });

    return list.map(function (c) {
      return Object.assign(c, {
        css: 'display:flex;align-items:center;gap:8px;padding:11px 15px;border-radius:13px;cursor:pointer;' +
          'font-size:13px;font-weight:700;white-space:nowrap;' +
          'background:var(--surface);color:var(--ink);border:1px solid var(--line)',
        iconCss: 'font-size:13px;line-height:1;opacity:.95'
      });
    });
  }

  /* ── Emergency ────────────────────────────────────────────────────────
     The design drew these as buttons but wired none of them. */

  /**
   * Place a call.
   *
   * On a phone `tel:` opens the dialer. A desktop browser usually does
   * nothing at all, so the number is copied and named in a toast — the
   * traveller can still read it out or dial it on another handset, which is
   * the one thing that must never fail on this screen.
   */
  function callNumber(number, label) {
    var plain = String(number).replace(/[^\d+]/g, '');
    var said = label ? label + ' · ' + number : number;
    try { window.location.href = 'tel:' + plain; } catch (e) { /* blocked — the toast still carries the number */ }
    copyText(number, function (copied) {
      toast(copied ? 'Calling ' + said + '. Number copied to the clipboard.'
                   : 'Calling ' + said + '.');
    });
  }

  function copyText(text, cb) {
    function done(ok) { if (cb) cb(ok); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
      return;
    }
    done(false);
  }

  /**
   * Share where the traveller is, for the emergency screen.
   *
   * Uses the platform share sheet when there is one; otherwise the link goes
   * to the clipboard. Without a fix the note says so rather than sharing the
   * middle of Bishkek as if it were the user's position.
   */
  function shareLocation() {
    if (!ENG) return;
    function send(pos) {
      if (!pos) {
        toast(ENG.geoMessage() || 'Your position could not be determined, so there is nothing to share yet.');
        return;
      }
      var coords = pos.lat.toFixed(5) + ',' + pos.lng.toFixed(5);
      var link = 'https://www.openstreetmap.org/?mlat=' + pos.lat.toFixed(5) + '&mlon=' + pos.lng.toFixed(5) + '#map=17/' + coords.replace(',', '/');
      var text = 'I am at ' + coords + ' — ' + link;
      if (navigator.share) {
        navigator.share({ title: 'My location', text: text, url: link })
          .then(function () { toast('Location shared.'); })
          .catch(function () { /* the sheet was dismissed — say nothing */ });
        return;
      }
      copyText(text, function (ok) {
        toast(ok ? 'Location copied: ' + coords + '. Paste it to whoever needs it.'
                 : 'Your location is ' + coords + '.', 7000);
      });
    }
    if (ENG.position()) send(ENG.position());
    else { toast('Finding your location…', 2000); ENG.locate(send); }
  }

  /* ── Map interaction ──────────────────────────────────────────────────
     Pan, wheel/pinch zoom and pin focus. The transform is applied straight
     to the layer rather than held in state — dragging must not re-render the
     app sixty times a second. */

  /* The map used to be a drawing: a CSS grid with the pins positioned at
     hand-measured pixel offsets, panned and zoomed by transforming the layer.
     It is now a real OpenStreetMap. Leaflet handles dragging, wheel zoom and
     double-tap itself, so all that is left here is pointing the app's own
     buttons at it — nomad-engine.js owns the map object. */
  var ENG = window.NomadEngine || null;

  function mapEl() { return root && root.querySelector('[data-ref="mapLayer"]'); }

  /**
   * Centre the map on the traveller.
   *
   * With no position yet this used to quietly fit the whole country instead,
   * which looked like the button was broken — and once a first refusal had
   * been remembered there was no way left in the app to turn location on at
   * all. Asking is now what the button does when there is nothing to centre
   * on, and the outcome is reported either way.
   */
  function mapRecenter() {
    if (!ENG) return;
    if (ENG.position()) { ENG.recenter(); return; }
    requestLocation();
  }

  /** Ask for the position, and say what happened. */
  function requestLocation(after) {
    if (!ENG) return;
    if (!ENG.canAsk()) { setState({ routeNote: ENG.geoMessage() }); return; }
    setState({ routeNote: 'Looking for your location…' });
    ENG.locate(function (pos) {
      if (pos) {
        ENG.recenter();
        setState({ routeNote: '' });
        toast('Located you. Distances are now measured from where you are.');
        if (after) after(pos);
      } else {
        setState({ routeNote: ENG.geoMessage() });
      }
    });
  }

  // Bring the selected place into the middle of the visible map area.
  function mapFocusPin(pin) { if (ENG && pin) ENG.focusPlace(pin.id); }

  /**
   * Draw a real road route to `target` and report the distance and time.
   *
   * Shared by "Get directions" on a place and the Directions button on the
   * map card. Location is asked for first when we do not have it yet — OSRM
   * needs a starting point, and refusing is not an error, it is just a note.
   */
  function routeToPlace(target) {
    if (!ENG || !target) return;
    setState({ routeNote: 'Finding a route…' });
    function build() {
      ENG.route([target], 'driving', function (res) {
        if (res.error) { setState({ routeNote: res.error }); return; }
        ENG.drawRoute(res.coords);
        setState({
          routeNote: ENG.formatKm(res.distanceKm) + ' · ' + Math.round(res.minutes) + ' min by car to ' + target.name
        });
      });
    }
    if (ENG.position()) build();
    else ENG.locate(function (pos) { if (pos) build(); else setState({ routeNote: ENG.geoMessage() }); });
  }

  /* The patcher is positional and unkeyed, so tapping a second pin morphs the
     new place's text into the card that is already on screen — correct, but
     completely silent. Replay the entry animation whenever the selection
     changes so the card visibly answers the tap. */
  /**
   * Tell the assistant what is on screen.
   *
   * Run after every render so a question typed at any moment is answered
   * against the view the traveller is actually looking at, rather than in a
   * vacuum. Cheap: reading Leaflet's bounds and a name list, no work beyond
   * what the map already knows.
   */
  var SCREEN_NAMES = {
    home: 'Home', search: 'Search', place: 'Place', map: 'Map', ai: 'AI Assistant',
    itinerary: 'Itinerary', rewards: 'Rewards', challenge: 'Challenge', verify: 'Verify',
    review: 'Write review', saved: 'Saved places', trips: 'My trips', phrasebook: 'Phrasebook',
    currency: 'Currency', emergency: 'Emergency', profile: 'Profile'
  };

  function syncAssistantView() {
    if (!ENG || !ENG.setView) return;
    var st = state;
    var v = { screen: st.screen, screenName: SCREEN_NAMES[st.screen] || st.screen };

    // The map's own centre, zoom and visible places are read live by the
    // engine when a question is asked — panning does not re-render, so a
    // copy taken here would be stale.
    if (st.screen === 'map') {
      v.filter = st.mapFilter;
      if (st.routeNote) v.route = st.routeNote;
    }

    // Whatever place the traveller has in front of them.
    var subject = null;
    if (st.screen === 'place') subject = D.places.filter(function (p) { return p.id === st.placeId; })[0];
    else if (st.screen === 'map' && st.mapPin != null) subject = D.places.filter(function (p) { return p.id === st.mapPin; })[0];
    if (subject) {
      v.selected = subject.name;
      var br = placeBranches(subject);
      if (br.length) v.branches = br.map(function (b) { return b.addr; });

      // Whatever 2GIS has already told us about this place's stops.
      var tr = st.transport[subject.id];
      if (tr && tr.ok && tr.stops && tr.stops.length) {
        v.stops = tr.stops.slice(0, 4).map(function (s) {
          var city = s.routes.city.map(function (r) {
            return r.number + (r.electric ? ' (electric)' : '') + (r.night ? ' (night)' : '');
          });
          var bits = [s.name + ' — ' + s.metres + ' m away'];
          if (city.length) bits.push('city buses: ' + city.join(', '));
          if (s.routes.regional.length) {
            bits.push('regional coaches: ' + s.routes.regional.map(function (r) { return r.number + ' to ' + r.to; }).join(', '));
          }
          if (s.routes.train.length) bits.push('elektrichka: ' + s.routes.train.map(function (r) { return r.number; }).join(', '));
          return bits.join(' | ');
        });
      }
    }
    if (st.screen === 'itinerary') v.day = st.itinDay;

    v.trip = tripMemory(st);

    ENG.setView(v);
  }

  /**
   * What this traveller has already done, for the assistant to read.
   *
   * The assistant used to start every reload knowing nothing, so it kept
   * recommending Navat to someone who had eaten there on Tuesday and
   * verified it for a badge. All of this is already on the device — saved
   * places, challenge proofs, reviews written, trips kept — it was simply
   * never handed over.
   *
   * Deliberately small. It rides along with every question, so it is a few
   * lines of the most recent and most telling things rather than a log.
   */
  function tripMemory(st) {
    var trip = {};
    var nameOf = function (id) {
      var p = D.places.filter(function (x) { return x.id === id; })[0];
      return p ? p.name : null;
    };

    var saved = (st.favs || []).map(nameOf).filter(Boolean);
    if (saved.length) trip.saved = saved.slice(-8);

    // Challenge tasks marked verified: the strongest evidence of "been there".
    var done = [];
    Object.keys(st.proofs || {}).forEach(function (kind) {
      var chal = chalOf(kind);
      var tasks = (chal && chal.tasks) || [];
      Object.keys(st.proofs[kind] || {}).forEach(function (idx) {
        if (st.proofs[kind][idx] !== 'ok') return;
        var task = tasks[Number(idx)];
        if (task && task.what) done.push(task.what);
      });
    });
    if (done.length) trip.done = done.slice(-10);

    var reviewed = Object.keys(st.reviews || {}).map(function (id) { return nameOf(Number(id)); }).filter(Boolean);
    if (reviewed.length) trip.reviewed = reviewed.slice(-6);

    if ((st.userTrips || []).length) {
      trip.trips = st.userTrips.slice(-3).map(function (t) { return t.title || t.name; }).filter(Boolean);
    }

    return Object.keys(trip).length ? trip : null;
  }

  /**
   * Keep the floating assistant clear of the map card.
   *
   * The card's height is not fixed — a chain adds a scrolling row of branch
   * chips — so a hard-coded offset put the bubble straight over the card's
   * name and rating. Measure the card and sit above whatever is there.
   */
  function syncAiBubble() {
    var bubble = root && root.querySelector('[aria-label="Ask the AI assistant"]');
    if (!bubble) return;
    var frame = bubble.offsetParent;
    if (!frame) return;

    /* Always clear the tab bar. A flat 20px put the bubble straight on top
       of the Profile tab, and the bar's height is not a constant — the iOS
       home indicator and the Android navigation row are different sizes. */
    var bar = root.querySelector('[data-ref="tabBar"]');
    var floor = bar ? bar.offsetHeight : 0;

    var card = state.screen === 'map' ? root.querySelector('[data-ref="mapCardBox"]') : null;
    if (!card) { bubble.style.bottom = (floor + 14) + 'px'; return; }

    /* Offsets, not getBoundingClientRect. This runs immediately after the
       render that reveals the card, while the card's entry animation still
       has it translated 26px down — measuring its rect then reads the
       animated position and parks the bubble that much too low, straight
       over the card. offsetTop is layout, which transforms do not touch. */
    var top = 0, el = card;
    while (el && el !== frame) { top += el.offsetTop; el = el.offsetParent; }

    bubble.style.bottom = Math.max(floor + 14, Math.round(frame.clientHeight - top + 12)) + 'px';
  }

  var lastCardPin = null;
  function syncMapCard() {
    var box = root && root.querySelector('[data-ref="mapCardBox"]');
    if (!box) { lastCardPin = null; return; }
    if (state.mapPin === lastCardPin) return;
    lastCardPin = state.mapPin;
    // Assigned in full rather than cleared: box.style IS the inline style the
    // template wrote the animation into, so setting it back to '' would
    // delete the animation instead of restoring it.
    box.style.animation = 'none';
    void box.offsetWidth;              // forces the restart
    box.style.animation = CARD_ANIM;
  }
  var CARD_ANIM = 'nomCardUp .28s cubic-bezier(.34,1.28,.5,1) both';

  /** Mount or refresh the map. Called after every render of the map screen. */
  function syncMap() {
    if (!ENG || !ENG.leafletReady()) return;
    var el = mapEl();
    if (!el) return;

    /* The map screen sizes itself with min-height:100%, which a browser cannot
       resolve because every ancestor up to the scroller has an automatic
       height — with the drawn map gone there is no longer enough content to
       fill it, so the screen collapsed to the height of its controls and the
       map with it. Give it the scroller's measured height instead. */
    var screenEl = el.parentElement;
    var scroller = root && root.querySelector('[data-ref="scrollRef"]');
    if (screenEl && scroller && scroller.clientHeight) {
      var h = scroller.clientHeight + 'px';
      if (screenEl.style.height !== h) {
        screenEl.style.height = h;
        ENG.invalidateSize();
      }
    }
    var shown = visibleMapPlaces();
    // The engine used to look branches up itself, from the two chains the
    // bot hard-coded; everything 2GIS found drew nothing. Hand it the same
    // list the cards are showing.
    var sel = state.mapPin != null
      ? D.places.filter(function (p) { return p.id === state.mapPin; })[0] : null;
    ENG.mountMap(el, {
      places: shown,
      activeId: state.mapPin,
      branches: sel ? placeBranches(sel) : null,
      activeBranch: state.activeBranch,
      // Tapping a marker reveals its card.
      onSelect: function (id) { setState({ mapPin: id, routeNote: '', activeBranch: null }); },
      // Tapping the map itself — anywhere that is not a marker — puts it away.
      onBackground: function () {
        if (state.mapPin === null) return;
        setState({ mapPin: null, routeNote: '', activeBranch: null });
        ENG.drawRoute(null);
      },
      // Only refit when the screen is first opened or the filter changed;
      // refitting on every render would fight the user's own panning.
      fit: mapFitKey() !== lastMapFit
    });
    lastMapFit = mapFitKey();
  }

  var lastMapFit = null;
  function mapFitKey() { return state.mapFilter + '|' + (state.screen === 'map'); }

  function visibleMapPlaces() {
    var cats = D.mapGroups[state.mapFilter];
    return D.places.filter(function (p) {
      if (typeof p.lat !== 'number' || typeof p.lng !== 'number') return false;
      return !cats || cats.indexOf(p.cat) >= 0;
    });
  }

  // The whole list is shown — with 250+ countries a cap made most of them
  // unreachable by scrolling. Matches are ranked so "Ind" offers India before
  // British Indian Ocean Territory.
  /* ── Saved trips ──────────────────────────────────────────────────────
     "Save this trip" turns the itinerary on screen into an entry in My
     trips, kept on the device alongside the profile. The three trips from
     the design stay as the starting set. */

  var TRIPS_KEY = 'nomad.trips.v1';

  function loadTrips() {
    try {
      var v = JSON.parse(localStorage.getItem(TRIPS_KEY) || '[]');
      return Object.prototype.toString.call(v) === '[object Array]' ? v : [];
    } catch (e) { return []; }
  }
  function persistTrips(list) {
    try { localStorage.setItem(TRIPS_KEY, JSON.stringify(list)); } catch (e) { /* this session only */ }
  }
  function allTrips() {
    var mine = state.userTrips || [];
    var names = mine.map(function (t) { return t.name; });
    // a trip the user saved supersedes the sample of the same name
    var base = D.savedTrips.filter(function (t) { return names.indexOf(t.name) < 0; });
    return mine.concat(base);
  }

  // The itinerary totals come from the day tables rather than being retyped.
  function itineraryTotals() {
    var stops = 0, som = 0, usd = 0;
    Object.keys(D.itinerary).forEach(function (k) {
      var day = D.itinerary[k];
      stops += day.stops.length;
      var m = /([\d\s]+)\s*som/.exec(day.cost);
      if (m) som += parseInt(m[1].replace(/\s/g, ''), 10) || 0;
      var u = /\$(\d+)/.exec(day.cost);
      if (u) usd += parseInt(u[1], 10) || 0;
    });
    return { stops: stops, som: som, usd: usd };
  }

  function tripDates() {
    var lang = uiLang();
    var start = new Date();
    var end = new Date(start.getTime() + 2 * 86400000);
    try {
      var loc = lang === 'ky' ? 'ru' : lang;
      var full = new Intl.DateTimeFormat(loc, { day: 'numeric', month: 'long' });
      var dayOnly = new Intl.DateTimeFormat(loc, { day: 'numeric' });
      // same month reads better as "5–7 August" than "5 August – 7 August"
      if (start.getMonth() === end.getMonth()) return dayOnly.format(start) + '–' + full.format(end);
      return full.format(start) + ' – ' + full.format(end);
    } catch (e) {
      return start.getDate() + '–' + end.getDate();
    }
  }

  /* ── Trip routes ──────────────────────────────────────────────────────
     Each trip card carried the same hand-drawn picture of a route: a CSS
     grid with two coloured bars and two dots at fixed pixel offsets,
     identical for all three trips and unrelated to anywhere they go. These
     build a real one from the coordinates of the places the trip visits. */

  /** The places a trip visits, in order, as far as they can be resolved. */
  function tripPlaces(trip) {
    var out = [], seen = {};
    (trip.route || []).forEach(function (name) {
      var p = D.places.filter(function (x) { return x.name === name; })[0];
      if (p && typeof p.lat === 'number' && !seen[p.id]) { seen[p.id] = 1; out.push(p); }
    });
    return out;
  }

  /**
   * The places one itinerary day visits.
   *
   * Its stops are labelled for a reader — "Lunch at Faiza", "Drive to
   * Ala-Archa" — so each is matched back to the longest place name it
   * contains. Pass no day to get the whole three-day route.
   */
  function itineraryPlaces(day) {
    var days = day ? [String(day)] : Object.keys(D.itinerary);
    var out = [], seen = {};
    days.forEach(function (k) {
      ((D.itinerary[k] || {}).stops || []).forEach(function (s) {
        var label = String(s.n).toLowerCase();
        var hit = D.places.filter(function (p) {
          return typeof p.lat === 'number' && label.indexOf(p.name.toLowerCase()) >= 0;
        }).sort(function (a, b) { return b.name.length - a.name.length; })[0];
        if (hit && !seen[hit.id]) { seen[hit.id] = 1; out.push(hit); }
      });
    });
    return out;
  }

  /**
   * A small true-to-shape map of a trip.
   *
   * Web Mercator, fitted to the stops with padding, so the drawing is the
   * real geometry of the journey — a tight cluster for the city days, a long
   * eastward reach for Issyk-Kul. Returns '' when nothing resolved, and the
   * card falls back to a plain panel rather than a route to nowhere.
   */
  function tripRouteSvg(trip, w, h) {
    return routeSvg(tripPlaces(trip), w, h, trip.name);
  }

  function routeSvg(pts, w, h, seed) {
    if (pts.length < 1) return '';

    /* Both axes in radians. Mercator's y is derived from radians, so feeding
       it degrees of longitude would make x ~57× too large and flatten every
       route into a horizontal line. */
    function projY(lat) {
      var r = lat * Math.PI / 180;
      return Math.log(Math.tan(Math.PI / 4 + r / 2));
    }
    var xs = pts.map(function (p) { return p.lng * Math.PI / 180; });
    var ys = pts.map(function (p) { return projY(p.lat); });
    var minX = Math.min.apply(null, xs), maxX = Math.max.apply(null, xs);
    var minY = Math.min.apply(null, ys), maxY = Math.max.apply(null, ys);
    var padX = 26, padY = 22;
    var spanX = maxX - minX, spanY = maxY - minY;

    // A single stop, or several within a few hundred metres, would divide by
    // ~0 and fling the points off-canvas; give those a minimum span so the
    // cluster sits sensibly in the middle instead. Radians — about 1.3 km.
    var MIN_SPAN = 0.0002;
    if (spanX < MIN_SPAN) { var cx = (minX + maxX) / 2; minX = cx - MIN_SPAN / 2; spanX = MIN_SPAN; }
    if (spanY < MIN_SPAN) { var cy = (minY + maxY) / 2; minY = cy - MIN_SPAN / 2; spanY = MIN_SPAN; }

    // One scale for both axes keeps the shape undistorted.
    var scale = Math.min((w - padX * 2) / spanX, (h - padY * 2) / spanY);
    var offX = (w - spanX * scale) / 2, offY = (h - spanY * scale) / 2;

    var xy = pts.map(function (p, i) {
      return {
        x: offX + (xs[i] - minX) * scale,
        // SVG y grows downward; Mercator y grows north.
        y: h - (offY + (ys[i] - minY) * scale)
      };
    });

    var line = xy.map(function (c, i) {
      return (i ? 'L' : 'M') + c.x.toFixed(1) + ' ' + c.y.toFixed(1);
    }).join(' ');

    var dots = xy.map(function (c, i) {
      var first = i === 0, last = i === xy.length - 1;
      var fill = first ? 'var(--green)' : last ? 'var(--brand)' : 'var(--surface)';
      var r = first || last ? 5.5 : 3.6;
      return '<circle cx="' + c.x.toFixed(1) + '" cy="' + c.y.toFixed(1) + '" r="' + r +
        '" fill="' + fill + '" stroke="var(--surface)" stroke-width="' + (first || last ? 2.5 : 2) + '"/>';
    }).join('');

    var pid = 'tg' + Math.abs(hashName(seed));
    return '<svg viewBox="0 0 ' + w + ' ' + h + '" width="100%" height="100%" ' +
      'preserveAspectRatio="none" aria-hidden="true" style="display:block">' +
      '<defs><pattern id="' + pid + '" width="44" height="40" patternUnits="userSpaceOnUse">' +
      '<path d="M44 0 V40 M0 40 H44" stroke="var(--line)" stroke-width="1" fill="none"/></pattern></defs>' +
      '<rect width="' + w + '" height="' + h + '" fill="url(#' + pid + ')"/>' +
      (xy.length > 1
        ? '<path d="' + line + '" fill="none" stroke="var(--brand)" stroke-width="3.5" ' +
          'stroke-linecap="round" stroke-linejoin="round" opacity=".95"/>'
        : '') +
      dots + '</svg>';
  }

  // Pattern ids have to differ per card or every card reuses the first one.
  function hashName(s) {
    var h = 0, str = String(s);
    for (var i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
    return h;
  }

  /** Open the map and draw a road route through `pts`, labelled `label`. */
  function showRouteOnMap(label, pts, fallbackScreen) {
    if (!ENG || pts.length < 2) { if (fallbackScreen) go(fallbackScreen); return; }
    setState(function (st) {
      return { screen: 'map', mapPin: null, mapFilter: 'All', stack: st.stack.concat([st.screen]),
        routeNote: 'Plotting ' + label + '…' };
    });
    lastMapFit = null;
    ENG.route(pts, 'driving', function (res) {
      if (res.error) {
        // Still worth showing where it goes even with no road route.
        ENG.drawRoute(pts.map(function (p) { return [p.lat, p.lng]; }));
        setState({ routeNote: label + ' · ' + pts.length + ' stops (straight lines — ' + res.error + ')' });
        return;
      }
      ENG.drawRoute(res.coords);
      setState({
        routeNote: label + ' · ' + ENG.formatKm(res.distanceKm) +
          ' · ' + Math.round(res.minutes) + ' min driving · ' + pts.length + ' stops'
      });
    });
  }

  function showTripRoute(trip) {
    showRouteOnMap(term('trips', trip.name), tripPlaces(trip), 'itinerary');
  }

  function currentTripName() { return tr('en').threeDays; }
  function isTripSaved() {
    return (state.userTrips || []).some(function (t) { return t.name === currentTripName(); });
  }

  function saveTrip() {
    if (isTripSaved()) { go('trips'); return; }
    var tot = itineraryTotals();
    var trip = {
      name: currentTripName(),
      when: tripDates(),
      stops: tot.stops,
      cost: fmt(tot.som) + ' som · $' + tot.usd,
      time: '6 h 20 travel',
      active: true,
      tags: ['Bishkek', 'Ala-Archa', 'Burana'],
      route: itineraryPlaces().map(function (p) { return p.name; })
    };
    var list = (state.userTrips || []).concat([trip]);
    persistTrips(list);
    setState({ userTrips: list });
  }

  /* Lowercase, and drop combining marks where the runtime can, so "cote"
     finds "Côte d'Ivoire" and "turkiye" finds "Türkiye". Cyrillic folds the
     same way on both sides of the comparison, so it stays consistent. */
  /* The combining-marks block, built from an ASCII string: the characters
     themselves are invisible in a source file and do not survive being
     copied through tools that normalise Unicode. */
  var COMBINING_MARKS = new RegExp('[\u0300-\u036f]', 'g');

  function foldCase(s) {
    s = String(s == null ? '' : s).toLowerCase();
    try { return s.normalize('NFD').replace(COMBINING_MARKS, ''); }
    catch (e) { return s; }   // no Unicode normalisation available
  }

  /* The localised name of every country, built once per language.
     countryName() is cheap on its own, but the filter below asks for all
     ~250 of them on every keystroke. */
  var localisedNames = {};
  function localisedCountryName(code, english) {
    var table = localisedNames[uiLang()] || (localisedNames[uiLang()] = {});
    if (table[code] === undefined) table[code] = countryName(code, english);
    return table[code];
  }

  /* Countries are searched by the name the traveller can actually see.
     The list shows localised names — Польша in Russian, Кыргызстан in
     Kyrgyz — but this used to match only the English c[1], so someone who
     had just switched the app to Russian typed "Пол", got "no country
     matches that", and had to guess the English spelling to get through
     the last step of the intro. Both names are matched now. */
  function filteredCountries() {
    var q = foldCase(state.obQuery.trim());
    if (!q) return D.countries;
    var starts = [], contains = [];
    D.countries.forEach(function (c) {
      // An exact two-letter code is a deliberate shortcut: "kg", "de", "us".
      if (q.length === 2 && foldCase(c[0]) === q) { starts.push(c); return; }

      var names = [foldCase(c[1]), foldCase(localisedCountryName(c[0], c[1]))];
      var best = -1;
      for (var i = 0; i < names.length; i++) {
        var at = names[i].indexOf(q);
        if (at === 0) { best = 0; break; }           // a prefix match wins outright
        if (at > 0 && best < 0) best = at;
      }
      if (best === 0) starts.push(c);
      else if (best > 0) contains.push(c);
    });
    return starts.concat(contains);
  }

  /* The profile-complete flourish: a dashed route draws itself across the
     screen and a map pin lands at the end of it. Nothing in common with the
     badge celebration, which is confetti and light rays. */
  function routeHtml() {
    var d = 'M14 128 C 78 128, 92 74, 148 66 S 236 78, 268 30';
    var len = 470;
    return '<svg viewBox="0 0 360 150" width="100%" height="150" fill="none" style="display:block;overflow:visible">' +
      '<defs><path id="nomRoutePath" d="' + d + '"/></defs>' +
      // the road, then the dashed line drawing itself along it
      '<path d="' + d + '" stroke="var(--line)" stroke-width="7" stroke-linecap="round" opacity=".55"/>' +
      '<path d="' + d + '" stroke="var(--brand)" stroke-width="3.4" stroke-linecap="round" ' +
      'stroke-dasharray="8 11" style="--len:' + len + ';stroke-dashoffset:' + len +
      ';animation:nomDraw 1.5s .15s cubic-bezier(.4,0,.2,1) forwards"/>' +
      '<circle cx="14" cy="128" r="7" fill="var(--green)" stroke="var(--bg)" stroke-width="3"/>' +
      // a traveller running the route ahead of the line, arriving as the pin lands
      '<circle r="6.5" fill="var(--brandInk)" stroke="var(--brand)" stroke-width="3">' +
      '<animateMotion dur="1.5s" begin="0.15s" fill="freeze" keyPoints="0;1" keyTimes="0;1" ' +
      'calcMode="spline" keySplines="0.4 0 0.2 1"><mpath href="#nomRoutePath"/></animateMotion>' +
      '<animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.08;0.86;1" dur="1.75s" begin="0.15s" fill="freeze"/>' +
      '</circle>' +
      '<g style="animation:nomPin .7s 1.45s cubic-bezier(.34,1.5,.5,1) both;transform-origin:268px 30px">' +
      '<path d="M268 10a13 13 0 0 1 13 13c0 9.5-13 22-13 22s-13-12.5-13-22a13 13 0 0 1 13-13Z" ' +
      'fill="var(--brand)" stroke="var(--bg)" stroke-width="3"/>' +
      '<circle cx="268" cy="23" r="4.6" fill="var(--bg)"/></g>' +
      '</svg>';
  }

  // The design built these two as React element trees; same markup, as HTML.
  function celebRaysHtml() {
    var out = '';
    for (var i = 0; i < 12; i++) {
      out += '<div style="position:absolute;left:50%;top:50%;width:30px;height:200px;margin-left:-15px;margin-top:-200px;' +
        'transform-origin:50% 100%;transform:rotate(' + (i * 30) + 'deg);' +
        'background:linear-gradient(180deg, rgba(160,61,78,0) 0%, rgba(160,61,78,.16) 100%);' +
        'clip-path:polygon(50% 0, 100% 100%, 0 100%);opacity:' + (i % 2 ? '.55' : '1') + '"></div>';
    }
    return '<div style="position:absolute;left:50%;top:50%;margin-left:-200px;margin-top:-200px;width:400px;height:400px;' +
      'animation:nomRaySpin 18s linear infinite">' + out + '</div>';
  }

  function celebConfettiHtml() {
    var cols = ['#A03D4E', '#C08A3E', '#3E7A5A', '#D9B98C', '#B8485A'];
    var out = '';
    for (var i = 0; i < 20; i++) {
      var round = i % 4 === 0;
      out += '<div style="position:absolute;top:-30px;left:' + (5 + ((i * 41) % 90)) + '%;' +
        'width:' + (round ? 9 : 7) + 'px;height:' + (round ? 9 : 14) + 'px;' +
        'border-radius:' + (round ? '50%' : '2px') + ';background:' + cols[i % 5] + ';' +
        'animation:nomFall ' + (2.5 + (i % 5) * 0.4).toFixed(2) + 's ' + (i * 0.14).toFixed(2) +
        's cubic-bezier(.35,.1,.6,1) infinite"></div>';
    }
    return '<div style="position:absolute;inset:0;overflow:hidden;pointer-events:none">' + out + '</div>';
  }

  /* ── Values ───────────────────────────────────────────────────────────
     The prototype's renderVals(), ported. */

  function buildVals() {
    var st = state;
    var s = st.screen;
    var plat = st.platform;
    var theme = st.theme;
    var place = D.places.filter(function (p) { return p.id === st.placeId; })[0] || D.places[0];
    var day = D.itinerary[st.itinDay];

    var eating = ['Kyrgyz cuisine', 'Coffee', 'Street food'];
    var inFilter = st.filter === 'All' ? function () { return true; }
      : st.filter === 'Food' ? function (p) { return eating.indexOf(p.cat) >= 0; }
      : st.filter === 'Stay' ? function (p) { return p.cat === 'Stay'; }
      : st.filter === 'Nature' ? function (p) { return ['Nature', 'Trek', 'Park'].indexOf(p.cat) >= 0; }
      : function (p) { return ['Landmark', 'Museum', 'Market', 'Culture'].indexOf(p.cat) >= 0; };

    var q = st.searchQuery.trim().toLowerCase();
    var inQuery = function (p) {
      return !q || (p.name + ' ' + p.cat + ' ' + p.addr + ' ' + p.desc + ' ' + p.dishes.join(' ')).toLowerCase().indexOf(q) >= 0;
    };
    var filtered = D.places.filter(function (p) { return inFilter(p) && inQuery(p); });
    var saved = D.places.filter(function (p) { return st.favs.indexOf(p.id) >= 0; });

    var mapCats = D.mapGroups[st.mapFilter];
    var visiblePins = D.mapPins.filter(function (mp) {
      if (!mapCats) return true;
      var pl = D.places.filter(function (x) { return x.id === mp.id; })[0];
      return pl && mapCats.indexOf(pl.cat) >= 0;
    });
    // Only a pin the traveller tapped — and that the current filter still
    // shows — puts a card on screen. Nothing selected means no card.
    var activePin = visiblePins.filter(function (mp) { return mp.id === st.mapPin; })[0] || null;
    var pin = activePin ? D.places.filter(function (p) { return p.id === activePin.id; })[0] || null : null;

    var xp = earnedXp();
    var lvl = levelOf(xp);
    var earnedBadges = D.badgeList.filter(function (b) { return isEarned(b.kind); });
    var nextBadge = D.badgeList.filter(function (b) { return !isEarned(b.kind); })
      .sort(function (a, b) { return (verifiedCount(b.kind) / b.tasks.length) - (verifiedCount(a.kind) / a.tasks.length); })[0];
    var placeReviews = reviewsFor(place);
    var vProof = proofOf(st);

    var screens = [['home', 'Home'], ['search', 'Search'], ['place', 'Place'], ['map', 'Map'], ['ai', 'AI Assistant'],
      ['itinerary', 'Itinerary'], ['rewards', 'Rewards'], ['challenge', 'Challenge'], ['verify', 'Verify'],
      ['review', 'Write review'], ['saved', 'Saved'], ['trips', 'My trips'], ['phrasebook', 'Phrasebook'],
      ['currency', 'Currency'], ['emergency', 'Emergency'], ['profile', 'Profile']];

    var cur = D.currencies.filter(function (c) { return c[0] === st.curCode; })[0] || D.currencies[0];

    var prof = activeProfile();
    var profCountry = countryByName(prof.country);
    var obDraft = { first: st.obFirst, last: st.obLast };
    var obPickedCountry = countryByName(st.obCountry);
    var obList = filteredCountries();
    // While onboarding, the draft language previews live; otherwise the app
    // follows the saved profile.
    var t = tr(st.onboarding ? st.obLang : (prof.lang || 'en'));
    var isLocal = st.obCountry === 'Kyrgyzstan';
    /* Computed once per render rather than inside the feed, because the
       template asks whether the section exists before asking what is in it. */
    var openNowRows = (ENG && ENG.openNow) ? ENG.openNow({ limit: 3 }) : [];
    // Whether the current onboarding step is satisfied — language always is.
    var obStepReady = st.obStep === OB_NAME ? !!st.obFirst.trim()
      : st.obStep === OB_COUNTRY ? !!st.obCountry
      : true;
    var fieldCss = 'width:100%;margin-top:9px;height:54px;padding:0 17px;border-radius:16px;background:var(--surface);' +
      "font-family:'Plus Jakarta Sans',system-ui,sans-serif;font-size:16px;font-weight:600;color:var(--ink);outline:none;" +
      'box-shadow:var(--shadow);border:1px solid ';

    return {
      themeClass: theme === 'dark' ? 'nomDark' : '',

      /* onboarding */
      t: t,
      aiGreeting: t.whereToday.replace('{name}', prof.first),
      isOnboarding: st.onboarding,
      obOverlayCss: 'position:absolute;inset:0;z-index:40;background:var(--bg);display:flex;flex-direction:column;' +
        (st.obExiting
          ? 'animation:nomIntroOut .46s cubic-bezier(.4,0,.2,1) both;pointer-events:none'
          : 'animation:nomSoftIn .42s cubic-bezier(.4,0,.2,1) both'),
      obIsSplash: st.onboarding && st.obStep === OB_SPLASH,
      obIsLang: st.onboarding && st.obStep === OB_LANG,
      obIsName: st.onboarding && st.obStep === OB_NAME,
      obIsCountry: st.onboarding && st.obStep === OB_COUNTRY,
      obIsDone: st.onboarding && st.obStep === OB_DONE,
      obIsForm: st.onboarding && st.obStep >= OB_LANG && st.obStep <= OB_COUNTRY,
      logoMark: raw(logoMarkHtml(146)),
      logoWord: raw(logoWordHtml(196)),
      logoMarkSmall: raw(logoMarkHtml(38)),
      logoWordSmall: raw(logoWordHtml(124)),
      obNext: obNext,
      obBack: obBack,
      obKey: obKeyDown,
      obFinish: obFinish,
      obStepLabel: t.step + ' ' + st.obStep + ' ' + t.of + ' 3',
      // Progress through three steps is meaningless when only one is shown.
      obShowSteps: st.obOnly === null,
      obLangs: D.languages.map(function (l) {
        var on = st.obLang === l.code;
        return {
          // "English English" reads badly, so the latin name only shows when
          // it differs from the endonym.
          name: l.name, native: l.native, hasAlt: l.name !== l.native,
          flag: flagOf(l.flag), isOn: on,
          go: function () { obPickLang(l.code); },
          css: 'display:flex;align-items:center;gap:14px;padding:16px 16px;border-radius:17px;cursor:pointer;transition:all .16s;border:1px solid ' +
            (on ? 'var(--brand);background:var(--brandSoft);box-shadow:var(--shadow)' : 'var(--line);background:var(--surface)')
        };
      }),
      obWelcomeTitle: (isLocal ? t.welcomeLocal : t.welcomeVisitor).replace('{name}', st.obFirst.trim()),
      obWelcomeFlag: obPickedCountry ? flagOf(obPickedCountry[0], 24) : '',
      obWelcomeSub: (isLocal ? t.welcomeSubLocal : t.welcomeSubVisitor)
        .replace('{country}', countryLabelOf(st.obCountry)),
      obDoneCta: t.startExploring,
      obRoute: raw(routeHtml()),
      obDots: [OB_LANG, OB_NAME, OB_COUNTRY].map(function (n) {
        return {
          css: 'flex:1;height:4px;border-radius:99px;transition:background .25s;background:' +
            (st.obStep >= n ? 'var(--brand)' : 'var(--line)')
        };
      }),
      obFirst: st.obFirst,
      obLast: st.obLast,
      obHasFirst: st.obFirst.trim().length > 0,
      setObFirst: function (e) { setState({ obFirst: e.target.value }); },
      setObLast: function (e) { setState({ obLast: e.target.value }); },
      obFirstCss: fieldCss + (st.obFirst.trim() ? 'var(--brand)' : 'var(--line)'),
      obLastCss: fieldCss + 'var(--line)',
      obInitials: initialsOf(obDraft),
      obQuery: st.obQuery,
      obHasQuery: st.obQuery.trim().length > 0,
      setObQuery: function (e) { setState({ obQuery: e.target.value }); },
      obClearQuery: function () { setState({ obQuery: '' }); },
      obShowPopular: !st.obQuery.trim(),
      obPopular: D.popularCountries.map(function (code) {
        var c = D.countries.filter(function (x) { return x[0] === code; })[0];
        var on = st.obCountry === c[1];
        return {
          name: countryName(code, c[1]), flag: flagOf(code),
          go: function () { obPick(c[1]); },
          css: 'flex:0 0 auto;white-space:nowrap;padding:9px 14px;border-radius:99px;font-size:13px;font-weight:600;cursor:pointer;transition:all .16s;border:1px solid ' +
            (on ? 'transparent;background:var(--ink);color:var(--bg)' : 'var(--line);background:var(--surface);color:var(--ink2)')
        };
      }),
      obCountries: obList.map(function (c) {
        var on = st.obCountry === c[1];
        return {
          name: countryName(c[0], c[1]), flag: flagOf(c[0]), isOn: on,
          go: function () { obPick(c[1]); },
          css: 'display:flex;align-items:center;gap:13px;padding:14px 15px;border-radius:15px;cursor:pointer;transition:all .14s;border:1px solid ' +
            (on ? 'var(--brand);background:var(--brandSoft)' : 'var(--line);background:var(--surface)')
        };
      }),
      obNoMatch: obList.length === 0,
      obCountry: st.obCountry,
      obCountryFlag: obPickedCountry ? flagOf(obPickedCountry[0]) : '',
      obNextLabel: st.obOnly !== null
        ? (st.obStep === OB_COUNTRY && !st.obCountry ? t.pickCountry : t.saveChanges)
        : st.obStep === OB_COUNTRY
          ? (!st.obCountry ? t.pickCountry : st.obEditing ? t.saveChanges : t.cont)
          : t.cont,
      obNextCss: 'height:56px;border-radius:18px;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;transition:all .2s;' +
        (obStepReady
          ? 'background:var(--brand);color:var(--brandInk);cursor:pointer;box-shadow:var(--shadowLg)'
          : 'background:var(--surface);border:1px solid var(--line);color:var(--ink3);cursor:default'),

      fullName: (prof.first + ' ' + prof.last).trim(),
      countryLabel: countryLabelOf(prof.country),
      countryFlag: profCountry ? flagOf(profCountry[0]) : '',
      isIos: plat === 'iOS',
      isAndroid: plat === 'Android',
      first: prof.first,
      initials: initialsOf(prof),
      scrollRef: true,
      screenRef: true,
      back: back,

      isHome: s === 'home', isSearch: s === 'search', isPlace: s === 'place', isMap: s === 'map',
      isAi: s === 'ai', isItin: s === 'itinerary', isRewards: s === 'rewards', isProfile: s === 'profile',
      isChallenge: s === 'challenge', isVerify: s === 'verify',
      showTabs: ['home', 'map', 'ai', 'profile', 'rewards'].indexOf(s) >= 0,

      setLight: function () { setState({ theme: 'light' }); },
      setDark: function () { setState({ theme: 'dark' }); },
      lightCss: 'display:flex;align-items:center;gap:7px;padding:8px 15px;border-radius:99px;font-size:13px;font-weight:700;cursor:pointer;transition:all .18s;' +
        (theme === 'light' ? 'background:var(--ink);color:var(--bg)' : 'color:var(--ink2)'),
      darkCss: 'display:flex;align-items:center;gap:7px;padding:8px 15px;border-radius:99px;font-size:13px;font-weight:700;cursor:pointer;transition:all .18s;' +
        (theme === 'dark' ? 'background:var(--ink);color:var(--bg)' : 'color:var(--ink2)'),
      setIos: function () { setState({ platform: 'iOS' }); },
      setAndroid: function () { setState({ platform: 'Android' }); },
      iosCss: 'padding:8px 15px;border-radius:99px;font-size:13px;font-weight:700;cursor:pointer;transition:all .18s;' +
        (plat === 'iOS' ? 'background:var(--ink);color:var(--bg)' : 'color:var(--ink2)'),
      androidCss: 'padding:8px 15px;border-radius:99px;font-size:13px;font-weight:700;cursor:pointer;transition:all .18s;' +
        (plat === 'Android' ? 'background:var(--ink);color:var(--bg)' : 'color:var(--ink2)'),

      chips: [
        { name: '▶  Intro', go: replayIntro, accent: true },
        { name: '✦  New profile', go: newProfile, accent: true }
      ].concat(screens.map(function (x) {
        return { name: x[1], go: function () { jump(x[0]); }, on: s === x[0] };
      })).map(function (c) {
        return {
          name: c.name, go: c.go,
          css: 'flex:0 0 auto;white-space:nowrap;padding:9px 16px;border-radius:99px;font-size:13px;font-weight:700;cursor:pointer;transition:all .16s;border:1px solid ' +
            (c.accent ? 'var(--brand);background:var(--brandSoft);color:var(--brand)'
              : c.on ? 'transparent;background:var(--brand);color:var(--brandInk)'
              : 'var(--line);background:var(--surface);color:var(--ink2)')
        };
      }),

      goHome: function () { jump('home'); },
      goSearch: function () { go('search'); },
      // "Get directions" on a place: open the map on that place and ask OSRM
      // for a real road route from where the traveller actually is.
      goMap: function () {
        var target = place;
        setState({ screen: 'map', mapPin: target.id, stack: st.stack.concat([st.screen]) });
        lastMapFit = null;                       // let the map re-centre on it
        routeToPlace(target);
      },
      goMapTab: function () { jump('map'); },
      goAi: function () { jump('ai'); },
      goAiTab: function () { jump('ai'); },
      goProfile: function () { jump('profile'); },
      goItin: function () { go('itinerary'); },
      goRewards: function () { jump('rewards'); },

      tabHome: tabCss(s === 'home'),
      tabMap: tabCss(s === 'map'),
      tabAi: tabCss(s === 'ai' || s === 'itinerary'),
      tabProfile: tabCss(['profile', 'rewards', 'challenge', 'verify'].indexOf(s) >= 0),

      hasOpenNow: openNowRows.length > 0,
      /* Says which of the two orderings the reader is looking at, because
         "nearest" and "best rated" are very different lists and it would
         otherwise be a mystery which one arrived. */
      openNowSub: ENG && ENG.position() ? t.openNowNear : t.openNowRated,
      openNow: openNowRows.map(function (p) {
        var left = ENG && ENG.closingSoon ? ENG.closingSoon(p) : null;
        return {
          name: p.name, slot: p.slot, ph: p.ph,
          cat: catOf(p.cat), dot: catDotCss(p.cat, 6),
          hasDist: !!p.dist, dist: p.dist || '',
          // Only shown when it is nearly too late to be worth going.
          shut: left ? (t.closesIn || 'closes in') + ' ' + left + ' min' : '',
          shutCss: left
            ? 'flex:0 0 auto;font-size:10.5px;font-weight:800;color:var(--brand);text-align:right;line-height:1.3;max-width:76px'
            : 'display:none',
          go: function () { openPlace(p.id); }
        };
      }),
      nearby: [D.places[4], D.places[5], D.places[10], D.places[6]].map(function (p) {
        return {
          name: p.name, rating: p.rating.toFixed(1), dist: micro(p.dist), slot: p.slot, ph: p.ph,
          go: function () { openPlace(p.id); }
        };
      }),
      popular: [
        { name: 'Issyk-Kul Lake', meta: '4 h from Bishkek · May–Sep', slot: 'v2-issykkul', ph: 'Issyk-Kul — blue lake with snow peaks', go: function () { byName('Issyk-Kul Lake'); } },
        { name: 'Ala-Archa', meta: '45 min · trails from 1 hour', slot: 'v2-alaarcha', ph: 'Ala-Archa gorge in summer', go: function () { byName('Ala-Archa National Park'); } },
        { name: 'Ala-Kul Trek', meta: '2–4 days · July–September', slot: 'v2-alakul', ph: 'Ala-Kul turquoise lake', go: function () { byName('Ala-Kul Lake'); } },
        { name: 'Burana Tower', meta: '1 h from Bishkek · year round', slot: 'v2-burana', ph: 'Burana minaret at golden hour', go: function () { byName('Burana Tower'); } }
      ],
      restaurants: [D.places[0], D.places[1]].map(card),

      hasNext: !!nextBadge,
      nextArt: nextBadge ? badgeArt(nextBadge.kind, 46, true) : null,
      nextName: nextBadge ? badgeNameOf(nextBadge.kind) : '',
      nextProg: nextBadge ? verifiedCount(nextBadge.kind) + ' ' + t.of + ' ' + nextBadge.tasks.length + ' ' + t.verifiedLower : '',
      nextPct: nextBadge ? Math.round((verifiedCount(nextBadge.kind) / nextBadge.tasks.length) * 100) + '%' : '0%',
      nextWorth: nextBadge ? fmt(Math.round(nextBadge.xp / D.RATE)) + ' ' + t.somWord + ' ' + t.whenItClears : '',
      goNext: function () { if (nextBadge) openChallenge(nextBadge.kind); else jump('rewards'); },

      searchQuery: st.searchQuery,
      setSearch: function (e) { setState({ searchQuery: e.target.value }); },
      clearSearch: function () { setState({ searchQuery: '' }); },
      hasQuery: st.searchQuery.trim().length > 0,
      filters: ['All', 'Food', 'Stay', 'Nature', 'Culture'].map(function (fname) {
        return { name: term('filters', fname), go: function () { setState({ filter: fname }); }, css: chipCss(st.filter === fname) };
      }),
      resultCount: filtered.length === 0 ? t.noMatches : filtered.length + ' ' + t.placesWord,
      hasResults: filtered.length > 0,
      noResults: filtered.length === 0,
      emptyHint: q ? 'Nothing here matches “' + st.searchQuery.trim() + '”.' : 'Nothing in this category yet.',
      resetSearch: function () { setState({ searchQuery: '', filter: 'All' }); },
      results: filtered.map(card),

      isSaved: s === 'saved',
      savedList: saved.map(card),
      hasSaved: saved.length > 0,
      noSaved: saved.length === 0,
      savedCountLabel: saved.length + ' ' + t.placesWord,
      goExplore: function () { jump('home'); },

      pName: place.name, pCat: catOf(place.cat), pRating: place.rating.toFixed(1),
      pReviews: place.reviews + (st.reviews[place.id] || []).length,
      pDist: micro(place.dist), pPrice: micro(place.price), pHours: micro(place.hours), pTravel: micro(place.travel),
      pDesc: descOf(place), pAddr: addrOf(place), pDishes: place.dishes.map(function (x) { return term('dishes', x); }), pListTitle: listTitleOf(place.listTitle),
      pSlot: place.slot, pPh: place.ph,
      pCatCss: catChipCss(place.cat),
      pCatDot: catDotCss(place.cat, 8),
      pPhotoIsRep: !!(window.isRepresentativePhoto && window.isRepresentativePhoto(place.slot)),

      /* The branches this chain has beyond the address above. */
      pHasBranches: placeBranches(place).length > 0,
      pBranchesLoading: !!(branchEntry(place) && branchEntry(place).loading),
      pBranchCount: (function () {
        var n = placeBranches(place).length;
        var live = branchEntry(place);
        // 2GIS reports the chain's own total, which can exceed what one
        // query returns; say so rather than implying the list is all of it.
        var total = live && live.ok ? live.total : 0;
        return total > n + 1 ? (n + ' ' + t.ofWord + ' ' + (total - 1)) : (n + ' ' + t.moreWord);
      })(),
      pBranches: placeBranches(place).map(function (b) {
        return {
          addr: b.addr,
          isApprox: /approx/.test(b.geo || ''),
          dist: branchDistance(b),
          dot: catDotCss(place.cat, 10, true),
          go: function () { showBranchOnMap(place, b); }
        };
      }),
      pHeart: st.favs.indexOf(place.id) >= 0 ? '#A03D4E' : 'none',
      pFav: function () { toggleFav(place.id); },
      pFavLabel: st.favs.indexOf(place.id) >= 0 ? 'Remove ' + place.name + ' from saved' : 'Save ' + place.name,
      pReviewList: placeReviews.map(function (rv, i) {
        return {
          who: rv.who, from: countryLabelOf(rv.from), when: rv.when, text: rv.text, verified: rv.verified,
          initials: rv.who.split(' ').map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase(),
          isMine: rv.when === 'just now',
          stars: [1, 2, 3, 4, 5].map(function (n) { return { on: rv.stars >= n, off: rv.stars < n }; }),
          key: i
        };
      }),

      mapFilters: ['All', 'Food', 'Stay', 'Parks', 'Culture', 'Markets'].map(function (mname) {
        return {
          name: term('filters', mname),
          /* Changing category clears the route with it. It used to survive:
             ask for directions to a park, switch to Food, and the line to
             the park stayed drawn across a map that no longer showed it,
             with its distance still in the note above. */
          go: function () {
            if (st.mapFilter === mname) return;
            setState({ mapFilter: mname, mapPin: null, routeNote: '' });
            if (ENG) ENG.drawRoute(null);
          },
          css: chipCss(st.mapFilter === mname)
        };
      }),
      hasPins: visiblePins.length > 0,
      noPins: visiblePins.length === 0,

      /* Legend for the pin colours, built from what is actually on screen
         and ordered by how many pins each category has. */
      mapLegend: (function () {
        var counts = {};
        visiblePins.forEach(function (mp) {
          var pl = D.places.filter(function (x) { return x.id === mp.id; })[0];
          if (pl) counts[pl.cat] = (counts[pl.cat] || 0) + 1;
        });
        return Object.keys(counts)
          .sort(function (a, b) { return counts[b] - counts[a]; })
          .map(function (cat) {
            return { name: catOf(cat), dot: catDotCss(cat, 9) };
          });
      })(),
      mapRecenter: mapRecenter,
      mapZoomIn: function () { if (ENG) ENG.zoomBy(1); },
      mapZoomOut: function () { if (ENG) ENG.zoomBy(-1); },
      pins: visiblePins.map(function (p) {
        var on = activePin && activePin.id === p.id;
        return {
          label: p.label,
          go: function () { setState({ mapPin: p.id }); mapFocusPin(p); },
          css: 'position:absolute;top:' + p.top + 'px;left:' + p.left + 'px;display:flex;flex-direction:column;align-items:center;gap:5px;cursor:pointer;z-index:' + (on ? 4 : 3),
          chipCss: 'padding:7px 12px;border-radius:99px;white-space:nowrap;font-size:11.5px;font-weight:700;box-shadow:var(--shadow);' +
            (on ? 'background:var(--brand);color:var(--brandInk)' : 'background:var(--surface);color:var(--ink)'),
          dotCss: 'width:' + (on ? 13 : 10) + 'px;height:' + (on ? 13 : 10) + 'px;border-radius:50%;border:2.5px solid #FFF;box-shadow:0 2px 6px rgba(27,20,17,.25);background:' +
            (on ? 'var(--brand)' : 'var(--ink2)')
        };
      }),
      // The card only exists once a pin has been tapped, so every field below
      // is read behind `hasMapCard` and `pin` is never dereferenced when null.
      hasMapCard: !!pin,
      showMapHint: !pin && visiblePins.length > 0,
      mapHint: t.tapAPin,
      mapCardName: pin ? pin.name : '',
      mapCardRating: pin ? pin.rating.toFixed(1) : '',
      mapCardCat: pin ? catOf(pin.cat) : '',
      mapCardDot: pin ? catDotCss(pin.cat, 8) : '',
      // The rings that appear around the map when a chain is selected.
      mapCardHasBranches: !!(pin && placeBranches(pin).length),
      mapCardBranches: pin ? (placeBranches(pin).length + ' ' + t.branchesShown) : '',
      /* The nearest stop to the selected pin, with its city route numbers.
         Transport lives on the map now, where geography is. */
      mapCardHasBus: !!(pin && (st.transport[pin.id] || {}).ok &&
        (st.transport[pin.id].stops || []).length &&
        st.transport[pin.id].stops[0].routes.city.length),
      mapCardBusStop: (function () {
        var e = pin && st.transport[pin.id];
        if (!e || !e.ok || !e.stops.length) return '';
        var s = e.stops[0];
        return s.name + ' · ' + (ENG ? ENG.formatKm(s.metres / 1000) : s.metres + ' m');
      })(),
      mapCardBusRoutes: (function () {
        var e = pin && st.transport[pin.id];
        if (!e || !e.ok || !e.stops.length) return '';
        var city = e.stops[0].routes.city;
        var nums = city.slice(0, 10).map(function (r) { return r.number; });
        return nums.join(' · ') + (city.length > nums.length ? ' +' + (city.length - nums.length) : '');
      })(),
      mapCardBusGo: function (e) {
        if (e && e.stopPropagation) e.stopPropagation();
        var entry = pin && st.transport[pin.id];
        if (entry && entry.stops && entry.stops.length && ENG) {
          ENG.panTo(entry.stops[0].point.lat, entry.stops[0].point.lng, 17);
        }
      },

      mapCardBranchList: (pin ? placeBranches(pin) : []).map(function (b) {
        return {
          addr: b.addr,
          dot: catDotCss(pin.cat, 8, true),
          go: function (e) {
            if (e && e.stopPropagation) e.stopPropagation();
            setState({ activeBranch: b.addr });
            if (ENG) ENG.panTo(b.lat, b.lng, 17);
          },
          css: 'flex:0 0 auto;display:flex;align-items:center;gap:7px;padding:8px 13px;border-radius:11px;' +
            'background:var(--surface2);white-space:nowrap;font-size:12px;font-weight:600;color:var(--ink2);cursor:pointer'
        };
      }),
      mapCardPrice: pin ? micro(pin.price) : '',
      mapCardSlot: pin ? pin.slot : '',
      mapCardPh: pin ? pin.ph : '',
      // `dist` is the written-in string until the browser shares a position,
      // at which point the engine has replaced it with a measurement.
      hasMapCardDist: !!(pin && pin.dist),
      mapCardDist: pin ? pin.dist : '',
      mapCardGo: function () { if (pin) openPlace(pin.id); },
      mapCardClose: function (e) {
        if (e && e.stopPropagation) e.stopPropagation();
        setState({ mapPin: null, routeNote: '' });
        if (ENG) ENG.drawRoute(null);
      },
      mapCardRoute: function (e) {
        if (e && e.stopPropagation) e.stopPropagation();
        if (pin) routeToPlace(pin);
      },
      routeNote: st.routeNote,
      hasRouteNote: !!st.routeNote,

      /* Offered whenever the app has no position — whether it was refused,
         failed, or was never asked for. */
      showLocateCta: !!(ENG && !ENG.position()),
      locateTitle: ENG && !ENG.canAsk() ? t.locationBlocked : t.useMyLocation,
      locateSub: ENG && !ENG.canAsk() ? ENG.geoMessage() : t.useMyLocationSub,
      locateMe: function () { requestLocation(); },

      hasChat: st.chat.length > 0,
      isEmpty: st.chat.length === 0,
      typing: st.typing,
      promptCards: D.prompts.map(function (p) {
        return { q: aiOf(p.q, 'q', p.q), s: aiOf(p.q, 's', p.s), go: function () { ask(p.q); } };
      }),
      chatMsgs: st.chat.map(function (m) {
        return {
          text: m.text, isMe: m.who === 'me', isAi: m.who === 'ai', hasItin: !!m.itin,
          hasNote: !!m.note, note: m.note || '',
          hasChips: !!(m.chips && m.chips.length),
          chips: (m.chips || []).map(function (c) { return { name: c, go: function () { byName(c); } }; }),
          /* One card per place the answer cited: the photograph the place
             already has, its rating, how far it is, and a way straight to
             it on the map. Nothing here is fetched or generated — every
             field is a column the row already carries, which is why this
             works offline and costs no quota. */
          hasCards: !!(m.cards && m.cards.length),
          cards: (m.cards || []).map(function (p) {
            return {
              name: p.name,
              slot: p.slot,
              ph: p.ph,
              hasRating: typeof p.rating === 'number',
              rating: typeof p.rating === 'number' ? p.rating.toFixed(1) : '',
              cat: catOf(p.cat),
              dot: catDotCss(p.cat, 7),
              // Written-in until the browser shares a position, a real
              // measurement after — same field the map card reads.
              hasDist: !!p.dist,
              dist: p.dist || '',
              go: function () { openPlace(p.id); },
              goMap: function (e) {
                if (e && e.stopPropagation) e.stopPropagation();
                showOnMap(p);
              }
            };
          }),
          css: m.who === 'me'
            ? 'max-width:82%;align-self:flex-end;padding:14px 17px;border-radius:20px 20px 6px 20px;background:var(--brand);color:var(--brandInk);font-size:14.5px;font-weight:500;line-height:1.5;white-space:pre-line'
            : 'align-self:stretch;font-size:14.5px;line-height:1.62;color:var(--ink);white-space:pre-line'
        };
      }),
      resetChat: function () {
        // Clearing the thread has to clear what the model remembers of it too,
        // or the "new" conversation still answers as if the old one happened.
        if (ENG && ENG.resetHistory) ENG.resetHistory();
        setState({ chat: [], chatInput: '', typing: false });
      },
      chatInput: st.chatInput,
      setChatInput: function (e) { setState({ chatInput: e.target.value }); },
      chatKeyDown: chatKey,
      sendChat: sendChat,
      canSend: st.chatInput.trim().length > 0,
      sendCss: 'width:42px;height:42px;flex:0 0 42px;border-radius:14px;display:flex;align-items:center;justify-content:center;transition:all .18s;' +
        (st.chatInput.trim() ? 'background:var(--brand);color:var(--brandInk);cursor:pointer' : 'background:var(--surface2);color:var(--ink3);cursor:default'),

      itinDays: [1, 2, 3].map(function (d) {
        return {
          label: t.dayWord + ' ' + d,
          go: function () { setState({ itinDay: d }); },
          css: 'flex:1;padding:12px 6px;border-radius:14px;text-align:center;font-size:13.5px;font-weight:700;cursor:pointer;transition:all .16s;' +
            (st.itinDay === d ? 'background:var(--brand);color:var(--brandInk);box-shadow:var(--shadow)' : 'background:var(--surface);border:1px solid var(--line);color:var(--ink2)')
        };
      }),
      /* The itinerary's own route maps, drawn from the stops rather than the
         one hand-placed line the design used for every day. */
      itinHasRoute: itineraryPlaces().length > 0,
      itinRouteMap: raw(routeSvg(itineraryPlaces(), 360, 136, 'itin-all')),
      itinRouteMapSmall: raw(routeSvg(itineraryPlaces(), 320, 112, 'itin-chat')),
      itinShowAll: function () { showRouteOnMap(t.threeDays, itineraryPlaces()); },
      itinDayHasRoute: itineraryPlaces(st.itinDay).length > 1,
      itinShowDay: function () {
        showRouteOnMap(t.dayWord + ' ' + st.itinDay + ' · ' + moreOf('themes', day.theme, day.theme),
          itineraryPlaces(st.itinDay));
      },

      itinTheme: moreOf('themes', day.theme, day.theme), itinCost: micro(day.cost), itinWalk: micro(day.walk),
      itinStops: day.stops.map(function (x, i) {
        return {
          t: x.t, n: x.n, cat: catOf(x.cat), cost: micro(x.cost), travel: micro(x.travel), slot: x.slot, ph: x.ph,
          isLast: i === day.stops.length - 1,
          go: function () { byName(x.n); }
        };
      }),

      badges: D.badgeList.map(function (b) {
        var got = verifiedCount(b.kind) === b.tasks.length;
        return {
          name: badgeNameOf(b.kind), locked: !got, xp: fmt(b.xp) + ' XP',
          art: badgeArt(b.kind, 56, !got),
          go: function () { openChallenge(b.kind); },
          css: 'display:flex;flex-direction:column;align-items:center;gap:10px;padding:18px 8px 16px;border-radius:20px;cursor:pointer;transition:all .18s;background:var(--surface);border:1px solid var(--line);' +
            (got ? 'box-shadow:var(--shadow)' : 'opacity:.72'),
          nameCss: 'font-size:11.5px;font-weight:700;text-align:center;line-height:1.3;color:' + (got ? 'var(--ink)' : 'var(--ink3)'),
          xpCss: 'font-size:10.5px;font-weight:700;color:' + (got ? 'var(--green)' : 'var(--ink3)'),
          prog: verifiedCount(b.kind) + '/' + b.tasks.length
        };
      }),
      earnedLabel: earnedBadges.length + ' ' + t.of + ' ' + D.badgeList.length + ' ' + t.earnedLower,
      badgeCount: String(earnedBadges.length),
      badgeCountOf: earnedBadges.length + ' ' + t.of + ' ' + D.badgeList.length,
      levelLabel: moreOf('levels', lvl.name, lvl.name) + ' · ' + t.level + ' ' + lvl.n,
      ringCss: 'position:absolute;inset:0;border-radius:50%;background:conic-gradient(var(--brand) 0turn, var(--gold) ' +
        lvl.pct.toFixed(3) + 'turn, var(--line) ' + lvl.pct.toFixed(3) + 'turn)',
      levelBarCss: 'width:' + Math.round(lvl.pct * 100) + '%;height:100%;border-radius:99px;background:var(--brand);transition:width .5s',
      xpShort: xp >= 1000 ? (xp / 1000).toFixed(xp >= 10000 ? 0 : 1) + 'k' : String(xp),

      cArt: badgeArt(st.chalKind, 74, !isEarned(st.chalKind)),
      cName: badgeNameOf(st.chalKind),
      cXp: fmt(chalOf(st.chalKind).xp) + ' XP',
      cSom: '= ' + fmt(Math.round(chalOf(st.chalKind).xp / D.RATE)) + ' ' + t.somWord,
      cProg: verifiedCount(st.chalKind) + ' ' + t.of + ' ' + chalOf(st.chalKind).tasks.length + ' ' + t.verifiedLower,
      cPct: Math.round((verifiedCount(st.chalKind) / chalOf(st.chalKind).tasks.length) * 100) + '%',
      cIsEarned: isEarned(st.chalKind),
      cNotEarned: !isEarned(st.chalKind),
      cPerTask: fmt(Math.round(chalOf(st.chalKind).xp / chalOf(st.chalKind).tasks.length)) + ' ' + t.xpEach,
      cTasks: chalOf(st.chalKind).tasks.map(function (t2, i) {
        var ok = (st.proofs[st.chalKind] || {})[i] === 'ok';
        return {
          n: term('tasks', t2.n), at: micro(term('at', t2.at)), isOk: ok, isTodo: !ok,
          verified: t.verifiedOn + ' · ' + proofOfKind(t2.proof, 'short') + ' · 2 Aug',
          need: proofOfKind(t2.proof, 'label'),
          go: function (e) { if (!ok) openVerify(i, e); },
          rowCss: 'display:flex;gap:13px;padding:15px;border-radius:18px;transition:all .18s;background:var(--surface);border:1px solid var(--line);box-shadow:var(--shadow)',
          nodeCss: 'width:30px;height:30px;flex:0 0 30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;' +
            (ok ? 'background:var(--green);color:#FFF' : 'background:var(--surface2);color:var(--ink3);border:1px solid var(--line)'),
          nameCss: 'font-size:15px;font-weight:700;letter-spacing:-.02em;line-height:1.3;color:' + (ok ? 'var(--ink2)' : 'var(--ink)'),
          num: i + 1
        };
      }),

      vTaskName: term('tasks', taskOf(st).n),
      vTaskAt: micro(term('at', taskOf(st).at)),
      vChalName: badgeNameOf(st.chalKind),
      vXp: '+' + fmt(Math.round(chalOf(st.chalKind).xp / chalOf(st.chalKind).tasks.length)) + ' XP',
      vChecking: st.checking,
      vIdle: !st.checking,
      vPrimary: proofOfKind(vProof, 'label'),
      vPrimaryNote: moreOf('proofNotes', vProof, D.proofKinds[vProof].note),
      vIsQr: vProof === 'qr',
      vIsGps: vProof === 'gps',
      vIsReceipt: vProof === 'receipt',
      vIsPhoto: vProof === 'photo',
      vIsTrace: vProof === 'trace',
      vSwitched: !!st.proofAlt,
      submitProof: submitProof,
      vAlts: ['qr', 'receipt', 'gps', 'photo', 'trace']
        .filter(function (k) { return k !== vProof; })
        .map(function (k) {
          return { name: proofOfKind(k, 'label'), note: moreOf('proofNotes', k, D.proofKinds[k].note), go: function () { pickProof(k); } };
        }),

      xpBalance: fmt(xp),
      xpWorth: fmt(Math.round(xp / D.RATE)) + ' ' + t.somWord,
      xpRate: fmt(D.RATE) + ' XP = 1 ' + t.somWord,
      xpToNext: lvl.next ? fmt(lvl.toNext) + ' XP' : t.topLevel,
      xpNextName: moreOf('levels', lvl.next || lvl.name, lvl.next || lvl.name),

      goReview: function () { go('review'); },
      isPhrase: s === 'phrasebook', isCurrency: s === 'currency', isTrips: s === 'trips', isSos: s === 'emergency',

      phraseTabs: D.phrases.map(function (p) {
        return { name: p.name, go: function () { setState({ phraseCat: p.key }); }, css: chipCss(st.phraseCat === p.key) };
      }),
      phraseItems: (D.phrases.filter(function (p) { return p.key === st.phraseCat; })[0] || D.phrases[0]).items.map(function (it) {
        var on = st.speaking === it.id;
        var rec = !!D.phraseAudio[it.id];
        return {
          en: it.en, ky: it.ky, tr: it.tr,
          go: function () { speak(it); },
          isPlaying: on, isIdle: !on, isRecorded: rec,
          label: (on ? 'Stop ' : 'Hear ') + it.en + ' in Kyrgyz',
          css: 'position:relative;width:44px;height:44px;flex:0 0 44px;border-radius:14px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .18s;' +
            (on ? 'background:var(--brand);color:var(--brandInk)' : 'background:var(--brandSoft);color:var(--brand)')
        };
      }),
      recordedCount: (function () {
        var all = D.phrases.reduce(function (n, p) { return n + p.items.length; }, 0);
        var got = D.phrases.reduce(function (n, p) {
          return n + p.items.filter(function (i) { return D.phraseAudio[i.id]; }).length;
        }, 0);
        return got === 0 ? 'Kyrgyz · works offline · tap to hear it'
          : got === all ? 'Kyrgyz · works offline · spoken by a local'
          : 'Kyrgyz · works offline · ' + got + ' of ' + all + ' spoken by a local';
      })(),

      amount: st.amount,
      curCode: st.curCode,
      curPicking: st.curPicking,
      toggleCurPick: function () { setState(function (x) { return { curPicking: !x.curPicking }; }); },
      curCaretCss: 'flex:0 0 13px;transition:transform .18s ease;transform:rotate(' + (st.curPicking ? '180' : '0') + 'deg)',
      curPick: D.currencies.map(function (c) {
        var on = c[0] === st.curCode;
        return {
          code: c[0], name: c[1], isOn: on,
          css: 'display:flex;align-items:center;gap:10px;padding:12px 14px;cursor:pointer;' +
            (on ? 'background:var(--brandSoft)' : ''),
          // Choosing closes the panel: the answer is above it, and leaving it
          // open would hide the number the traveller opened this screen for.
          go: function () { setState({ curCode: c[0], curPicking: false }); }
        };
      }),
      curName: cur[1],
      curOut: Math.round((parseFloat(st.amount) || 0) * cur[3]).toLocaleString('en-US').replace(/,/g, ' ') + ' ' + t.somWord,
      curRate: '1 ' + st.curCode + ' = ' + cur[3].toFixed(2) + ' ' + t.somWord + ' · ' + t.todayRate,
      setAmount: function (e) { setState({ amount: e.target.value.replace(/[^0-9.]/g, '') }); },
      quickAmts: [20, 50, 100, 200, 500].map(function (n) {
        return {
          n: String(n),
          go: function () { setState({ amount: String(n) }); },
          css: 'flex:1;padding:12px 4px;border-radius:13px;text-align:center;font-size:13px;font-weight:700;cursor:pointer;transition:all .16s;border:1px solid ' +
            (st.amount === String(n) ? 'transparent;background:var(--ink);color:var(--bg)' : 'var(--line);background:var(--surface);color:var(--ink2)')
        };
      }),
      curAnchors: [['Samsa at the bazaar', 40], ['City bus, by card', 17], ['Beshbarmak at Navat', 900],
        ['Hostel dorm bed', 700], ['Taxi across the centre', 250]].map(function (a) {
        return {
          name: moreOf('anchors', a[0], a[0]),
          som: a[1] + ' ' + t.somWord,
          conv: '≈ ' + (a[1] / cur[3]).toFixed(a[1] < 100 ? 2 : 1) + ' ' + st.curCode
        };
      }),

      trips: allTrips().map(function (trip) {
        var routeSvg = tripRouteSvg(trip, 360, 112);
        return {
          name: term('trips', trip.name), when: term('trips', trip.when),
          cost: micro(trip.cost), time: micro(trip.time),
          stops: trip.stops + ' ' + t.stopsWord, isActive: trip.active, tags: trip.tags,
          /* The card reads these as t.activeCaps / t.estCost / t.travelCaps,
             but inside <sc-for as="t"> the loop variable shadows the strings
             table, so they resolved to nothing and the ACTIVE pill and both
             captions rendered blank. Carried on the trip itself instead. */
          activeCaps: t.activeCaps, estCost: t.estCost, travelCaps: t.travelCaps,
          hasRoute: !!routeSvg,
          routeMap: routeSvg ? raw(routeSvg) : '',
          // Tapping a trip now puts its actual route on the real map.
          go: function () { showTripRoute(trip); },
          css: 'border-radius:20px;overflow:hidden;background:var(--surface);border:1px solid ' +
            (trip.active ? 'var(--brand)' : 'var(--line)') + ';box-shadow:var(--shadow);cursor:pointer'
        };
      }),

      saveTrip: saveTrip,
      tripIsSaved: isTripSaved(),
      saveTripLabel: isTripSaved() ? t.tripSaved : t.saveTrip,
      saveTripCss: 'height:56px;border-radius:18px;display:flex;align-items:center;justify-content:center;gap:9px;' +
        'font-size:16px;font-weight:700;cursor:pointer;transition:all .25s;' +
        (isTripSaved()
          ? 'background:var(--greenSoft);color:var(--green);border:1px solid var(--green)'
          : 'background:var(--brand);color:var(--brandInk);box-shadow:var(--shadowLg)'),

      isReview: s === 'review',
      rStars: [1, 2, 3, 4, 5].map(function (n) {
        return {
          go: function () { setState({ reviewStars: n }); },
          isFull: st.reviewStars >= n,
          isEmpty: st.reviewStars < n,
          css: 'cursor:pointer;line-height:0;transition:transform .18s;color:' +
            (st.reviewStars >= n ? 'var(--gold)' : 'var(--ink3)') +
            (st.reviewStars >= n ? '' : ';opacity:.42') +
            (st.reviewStars === n ? ';transform:scale(1.1)' : '')
        };
      }),
      rLabel: ['Tap a cup to rate', 'Would not return', 'It was fine', 'Good, worth it', 'Really good', 'Send everyone here'][st.reviewStars],
      rPostCss: 'height:56px;border-radius:18px;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;transition:all .2s;' +
        (st.reviewStars > 0 ? 'background:var(--brand);color:var(--brandInk);cursor:pointer;box-shadow:var(--shadowLg)' : 'background:var(--surface);border:1px solid var(--line);color:var(--ink3);cursor:default'),
      rPostLabel: st.reviewStars > 0 ? 'Post review' : 'Rate it first',
      rText: st.reviewText,
      setRText: function (e) { setState({ reviewText: e.target.value }); },
      rPost: function () { postReview(place); },
      // The two slots beside it already take a dropped file or a double
      // click; this makes the same picker reachable by a single tap.
      rAddPhoto: function () {
        if (!window.imageSlotBrowse) return;
        if (!window.imageSlotBrowse(['v2-rev-a', 'v2-rev-b'])) {
          toast('Photo slots are not ready yet — try again in a moment.');
        }
      },

      celebrating: !!st.celebrate,
      celebArt: st.celebrate ? badgeArt(st.celebrate, 168, false) : null,
      celebName: st.celebrate ? badgeNameOf(st.celebrate) : '',
      celebSub: st.celebrate ? badgeSubOf(st.celebrate) : '',
      celebSom: st.celebrate ? 'Worth ' + fmt(Math.round(chalOf(st.celebrate).xp / D.RATE)) + ' som at any partner' : '',
      celebXp: '+' + fmt(st.celebN) + ' XP',
      closeCeleb: function () {
        if (celebTimer) { clearInterval(celebTimer); celebTimer = null; }
        setState({ celebrate: null });
      },
      celebRays: raw(celebRaysHtml()),
      celebConfetti: raw(celebConfettiHtml()),

      /* Floating assistant. Only where it adds something: the home screen
         and the map. It lifts clear of the map card when one is open, and
         sits left of the zoom column so it never covers a control. */
      showAiBubble: (s === 'home' || s === 'map') && !st.onboarding && !st.celebrate,
      aiBubbleHasLabel: s === 'map',
      aiBubbleLabel: t.askAboutMap,
      /* The map's bottom offset is a starting value only — the card's height
         varies with what is on it (a chain adds a row of branch chips), so
         syncAiBubble() measures the card after every render and lifts the
         bubble clear of whatever is actually there. */
      aiBubbleCss: 'position:absolute;z-index:12;right:18px;' +
        (s === 'map' ? (pin ? 'bottom:238px;' : 'bottom:126px;') : 'bottom:20px;') +
        'display:flex;align-items:center;gap:9px;height:52px;padding:0 18px;border-radius:99px;' +
        'background:var(--brand);box-shadow:var(--shadowLg);cursor:pointer;' +
        'transition:bottom .28s cubic-bezier(.4,0,.2,1);animation:nomCardUp .3s cubic-bezier(.34,1.28,.5,1) both',
      goAiFromBubble: function () { jump('ai'); },

      hasToast: !!st.toast,
      toast: st.toast,
      closeToast: function () {
        if (toastTimer) { clearTimeout(toastTimer); toastTimer = null; }
        setState({ toast: '' });
      },

      /* Our own support desk, above the national numbers. */
      supportTitle: supportCfg().name || t.supportName,
      supportSub: supportCfg().hours ? (t.supportSub + ' · ' + supportCfg().hours) : t.supportSub,
      supportNumbers: supportNumbers(t),
      supportChannels: supportChannels(t),

      /* Emergency — every one of these was drawn but inert. */
      call112: function () { callNumber('112', t.allServices); },
      call103: function () { callNumber('103', t.ambulance); },
      call102: function () { callNumber('102', t.police); },
      call101: function () { callNumber('101', t.fire); },
      callTourist: function () { callNumber('+996 705 00 91 02', t.touristPolice); },
      shareLocation: shareLocation,

      visitedCount: String(D.badgeList.reduce(function (n, b) { return n + verifiedCount(b.kind); }, 0)),

      goEditProfile: function () { openProfileEdit(OB_NAME); },
      goBadges: function () { jump('rewards'); },
      /* Straight to the challenge the verified tasks belong to — the one
         furthest along — rather than to the rewards screen, where they would
         have to find it again. With nothing verified yet there is no such
         challenge, so the badge list is the honest destination. */
      goVerified: function () {
        var best = null, most = 0;
        D.badgeList.forEach(function (b) {
          var n = verifiedCount(b.kind);
          if (n > most) { most = n; best = b; }
        });
        if (best) openChallenge(best.kind); else jump('rewards');
      },
      menu: [
        { name: t.mSaved, meta: String(saved.length), go: function () { go('saved'); }, icon: 'heart' },
        { name: t.mTrips, meta: allTrips().length + ' ' + t.savedWord, go: function () { go('trips'); }, icon: 'route' },
        { name: t.mRewards, meta: earnedBadges.length + ' ' + t.of + ' ' + D.badgeList.length, go: function () { jump('rewards'); }, icon: 'medal' },
        { name: t.mPhrases, meta: t.offlineWord, go: function () { go('phrasebook'); }, icon: 'book' },
        { name: t.mCurrency, meta: '1 USD = 87.42 som', go: function () { go('currency'); }, icon: 'swap' },
        { name: t.mEmergency, meta: '112', go: function () { go('emergency'); }, icon: 'alert' },
        {
          name: t.mLanguage,
          meta: langOf(prof.lang || 'en').native,
          go: function () { openProfileEdit(OB_LANG); }, icon: 'globe'
        }
        // "Edit profile" used to sit here, last in a list of unrelated
        // settings. It is the pencil beside the name now.
      ].map(function (m) {
        return Object.assign({}, m, {
          isHeart: m.icon === 'heart', isRoute: m.icon === 'route', isMedal: m.icon === 'medal',
          isBook: m.icon === 'book', isSwap: m.icon === 'swap', isAlert: m.icon === 'alert',
          isCog: m.icon === 'cog', isGlobe: m.icon === 'globe'
        });
      })
    };
  }

  /* ── Mount ────────────────────────────────────────────────────────────── */

  var root = null;
  var prevScreen = null;
  var prevChatLen = 0;
  var prevTyping = false;
  var prevObStep = -1;

  function draw() {
    handlers = [];
    var out = [];
    renderChildren(tplContent, buildVals(), out);
    morph(root, out);
    afterDraw();
  }

  // The design did this in componentDidUpdate: a new screen starts at the
  // top and replays its entry animation; the chat sticks to the bottom.
  function afterDraw() {
    // Each onboarding step puts the caret where the user is about to type,
    // but never steals it back if they have already tabbed elsewhere.
    if (state.onboarding) {
      if (prevObStep !== state.obStep) {
        prevObStep = state.obStep;
        // Nodes are reused across steps, so the entry animation has to be
        // restarted by hand or the change would land instantly.
        var pane = root.querySelector('[data-ob-pane]');
        if (pane) {
          pane.style.animation = 'none';
          void pane.offsetHeight;
          pane.style.animation = 'nomSoftUp .42s cubic-bezier(.4,0,.2,1) both';
        }
        var field = root.querySelector('[data-autofocus]');
        if (field && document.activeElement !== field) field.focus();
      }
    } else {
      prevObStep = -1;
    }

    // Mount the real map, or refresh its markers if it is already mounted.
    syncMap();
    syncMapCard();
    syncAiBubble();
    syncAssistantView();

    // Look up the buses for whatever place is open. Cached per place, so
    // re-renders and revisits cost nothing.
    if (state.screen === 'place') {
      loadBranches(D.places.filter(function (p) { return p.id === state.placeId; })[0]);
    }
    /* Transport belongs to the map, so it is fetched for whatever pin is
       selected there — that is where the card shows it, and where the
       assistant is asked "which bus gets me here". */
    if (state.screen === 'map' && state.mapPin != null) {
      var sel = D.places.filter(function (p) { return p.id === state.mapPin; })[0];
      loadBranches(sel);
      loadTransport(sel);
    }

    var scroller = root.querySelector('[data-ref="scrollRef"]');
    if (prevScreen !== state.screen) {
      // A phrase runs five to nine seconds; leaving the phrasebook used to
      // let it carry on playing over whatever screen came next.
      if (prevScreen === 'phrasebook' && state.speaking) {
        stopAudio();
        state.speaking = null;
      }
      prevScreen = state.screen;
      if (scroller) scroller.scrollTop = 0;
      var el = root.querySelector('[data-ref="screenRef"]');
      if (el) {
        el.style.animation = 'none';
        void el.offsetHeight;
        el.style.animation = 'nomIn .3s cubic-bezier(.22,.7,.2,1)';
      }
    } else if (state.screen === 'ai' && (prevChatLen !== state.chat.length || prevTyping !== state.typing)) {
      if (scroller) scroller.scrollTop = scroller.scrollHeight;
    }
    prevChatLen = state.chat.length;
    prevTyping = state.typing;
  }

  function invoke(el, attr, e) {
    var idx = el.getAttribute(attr);
    var fn = handlers[Number(idx)];
    if (typeof fn === 'function') fn(e);
  }

  function wireEvents() {
    // One delegated listener per event: the innermost handler wins, which is
    // how the design's nested cards behave (their inner controls all call
    // stopPropagation).
    root.addEventListener('click', function (e) {
      var el = e.target.closest ? e.target.closest('[data-h]') : null;
      if (el && root.contains(el)) invoke(el, 'data-h', e);
    });

    root.addEventListener('input', function (e) {
      var el = e.target.closest ? e.target.closest('[data-oi]') : null;
      if (el) invoke(el, 'data-oi', e);
    });

    root.addEventListener('keydown', function (e) {
      var typed = e.target.closest ? e.target.closest('[data-ok]') : null;
      if (typed) { invoke(typed, 'data-ok', e); return; }
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var btn = e.target.closest ? e.target.closest('[data-h][role="button"]') : null;
      if (btn && root.contains(btn)) { e.preventDefault(); invoke(btn, 'data-h', e); }
    });
  }

  function start() {
    root = document.getElementById('root');
    if (!root) return;

    // The intro is a first-run experience: once a profile exists it never
    // appears again.
    //   ?intro=1  replay it, prefilled from the saved profile
    //   ?reset=1  forget the profile entirely and start truly fresh
    var qs = location.search + location.hash;
    var replay = /[?&#]intro\b/.test(qs);
    var wipe = /[?&#]reset\b/.test(qs);
    if (wipe) {
      try { localStorage.removeItem(PROFILE_KEY); } catch (e) { /* nothing to clear */ }
    }
    var saved = wipe ? null : loadProfile();
    state.userTrips = wipe ? [] : loadTrips();
    if (wipe) { try { localStorage.removeItem(TRIPS_KEY); } catch (e) {} }

    if (saved) {
      state.profile = saved;
      state.first = saved.first;
      state.obFirst = saved.first;
      state.obLast = saved.last || '';
      state.obCountry = saved.country || '';
      state.obLang = saved.lang || 'en';
    }
    /* Every visit opens on the intro, not on Home.
       This is a demo before it is anyone's daily app: the intro is what
       explains what Nomad AI is, and someone opening the link has never
       seen it. A returning visitor is not made to retype anything — the
       saved profile is already loaded above, so the steps arrive prefilled
       and are a few taps to walk back through.
       For the original behaviour — intro on first run only — restore:
         if (!saved || replay) state.onboarding = true; */
    state.onboarding = true;
    if (saved && !replay) state.obStep = OB_SPLASH;

    prepareTemplate();
    wireEvents();
    prevScreen = state.screen;
    draw();

    if (ENG) {
      // The engine rewrites every place's distance once the browser says where
      // we are; re-draw so the written-in "0.8 km" strings become measurements.
      ENG.onChange(function () { setState({}); });
      /* Read the position only if permission was already granted — never ask
         here. A prompt no tap led to is dismissed by the browser, and enough
         dismissals turn into a remembered block for the whole site, at which
         point "Use my location" cannot bring the dialog back either. Telegram
         asks through its own dialog first, which is why it worked there and
         not here. The app already offers the button; pressing it is the
         gesture the browser wants. Until then the written-in distances from
         the middle of Bishkek stand, which is what they are for. */
      ENG.locateIfAllowed();
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
