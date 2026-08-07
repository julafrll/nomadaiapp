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
  <div class="{{ themeClass }}" style="min-height:100vh;background:var(--pagebg);color:var(--ink);padding:30px 28px 44px;font-family:'Plus Jakarta Sans',system-ui,sans-serif;transition:background .3s,color .3s">
  
    <div style="max-width:1080px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:22px;margin-bottom:26px">
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
  
    <div style="max-width:1080px;margin:0 auto;display:flex;flex-direction:column;align-items:center;gap:22px">
  
      <div class="nomScroll" style="display:flex;gap:7px;overflow-x:auto;max-width:100%;padding:4px">
        <sc-for list="{{ chips }}" as="c" hint-placeholder-count="8">
          <div onClick="{{ c.go }}" style="{{ c.css }}">{{ c.name }}</div>
        </sc-for>
      </div>
  
      <div style="position:relative;width:417px;height:876px;border-radius:56px;padding:12px;background:var(--bezel);box-shadow:0 30px 70px rgba(27,20,17,.22), 0 0 0 1px rgba(27,20,17,.06);transition:background .3s">
        <div style="position:relative;width:393px;height:852px;border-radius:45px;overflow:hidden;background:var(--bg);display:flex;flex-direction:column;transition:background .3s">
  
          <sc-if value="{{ isIos }}" hint-placeholder-val="{{ true }}">
            <div style="position:relative;z-index:6;height:52px;flex:0 0 52px;display:flex;align-items:flex-end;justify-content:space-between;padding:0 30px 8px;font-size:14px;font-weight:700;color:var(--ink)">
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
            <div style="position:relative;z-index:6;height:40px;flex:0 0 40px;display:flex;align-items:center;justify-content:space-between;padding:0 20px;font-size:13px;font-weight:700;color:var(--ink)">
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
                            <svg width="12" height="12" viewBox="0 0 24 24" style="color:var(--gold);flex:0 0 12px" fill="currentColor"><path d="M12 2l2.6 6.5L21 9.8l-4.8 4.4L17.5 21 12 17.6 6.5 21l1.3-6.8L3 9.8l6.4-1.3L12 2Z"/></svg>
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
                                <svg width="14" height="14" viewBox="0 0 24 24" style="color:var(--gold)" fill="currentColor"><path d="M12 2l2.6 6.5L21 9.8l-4.8 4.4L17.5 21 12 17.6 6.5 21l1.3-6.8L3 9.8l6.4-1.3L12 2Z"/></svg>
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
                              <svg width="14" height="14" viewBox="0 0 24 24" style="color:var(--gold)" fill="currentColor"><path d="M12 2l2.6 6.5L21 9.8l-4.8 4.4L17.5 21 12 17.6 6.5 21l1.3-6.8L3 9.8l6.4-1.3L12 2Z"/></svg>
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
                              <svg width="14" height="14" viewBox="0 0 24 24" style="color:var(--gold)" fill="currentColor"><path d="M12 2l2.6 6.5L21 9.8l-4.8 4.4L17.5 21 12 17.6 6.5 21l1.3-6.8L3 9.8l6.4-1.3L12 2Z"/></svg>
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
                    <image-slot id="{{ pSlot }}" shape="rect" placeholder="{{ pPh }}"></image-slot>
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
                        <div style="padding:6px 12px;border-radius:99px;background:var(--greenSoft);font-size:11.5px;font-weight:700;letter-spacing:.02em;color:var(--green)">{{ pCat }}</div>
                        <div style="display:flex;align-items:center;gap:5px">
                          <svg width="14" height="14" viewBox="0 0 24 24" style="color:var(--gold)" fill="currentColor"><path d="M12 2l2.6 6.5L21 9.8l-4.8 4.4L17.5 21 12 17.6 6.5 21l1.3-6.8L3 9.8l6.4-1.3L12 2Z"/></svg>
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
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style="color:var(--gold)"><path d="M12 2l2.6 6.5L21 9.8l-4.8 4.4L17.5 21 12 17.6 6.5 21l1.3-6.8L3 9.8l6.4-1.3L12 2Z"/></svg>
                                </sc-if>
                                <sc-if value="{{ s.off }}">
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style="color:var(--ink3);opacity:.3"><path d="M12 2l2.6 6.5L21 9.8l-4.8 4.4L17.5 21 12 17.6 6.5 21l1.3-6.8L3 9.8l6.4-1.3L12 2Z"/></svg>
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
                  <!-- One transformed layer: backdrop, pins and the user dot pan and zoom together. -->
                  <div data-ref="mapLayer" style="position:absolute;inset:0;transform-origin:0 0;will-change:transform;touch-action:none;cursor:grab">
                    <div style="position:absolute;left:-100%;top:-100%;width:300%;height:300%;background:var(--surface2)">
                      <div style="position:absolute;inset:0;background:repeating-linear-gradient(90deg,var(--line) 0 1px,transparent 1px 62px),repeating-linear-gradient(0deg,var(--line) 0 1px,transparent 1px 70px)"></div>
                    </div>
                    <div style="position:absolute;left:-600px;right:-600px;top:214px;height:20px;background:var(--line)"></div>
                    <div style="position:absolute;left:-600px;right:-600px;top:472px;height:14px;background:var(--line)"></div>
                    <div style="position:absolute;top:-600px;bottom:-600px;left:148px;width:18px;background:var(--line)"></div>
                    <div style="position:absolute;top:150px;left:196px;width:120px;height:96px;border-radius:14px;background:var(--greenSoft)"></div>
                    <div style="position:absolute;top:400px;left:36px;width:96px;height:78px;border-radius:14px;background:var(--greenSoft)"></div>
                    <div style="position:absolute;left:44px;top:588px;width:20px;height:20px;border-radius:50%;background:var(--green);border:3px solid #FFF;box-shadow:0 0 0 8px rgba(62,122,90,.18)"></div>
                    <sc-for list="{{ pins }}" as="pin" hint-placeholder-count="3">
                      <div onClick="{{ pin.go }}" role="button" tabIndex="0" aria-label="{{ pin.label }}" style="{{ pin.css }}">
                        <div style="{{ pin.chipCss }}">{{ pin.label }}</div>
                        <div style="{{ pin.dotCss }}"></div>
                      </div>
                    </sc-for>
                  </div>
  
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
  
                  <div style="margin-top:auto;position:relative;padding:0 16px 18px">
                    <div onClick="{{ mapCardGo }}" style="border-radius:22px;overflow:hidden;background:var(--surface);box-shadow:var(--shadowLg);cursor:pointer">
                      <div style="display:flex;justify-content:center;padding:10px 0 4px"><div style="width:40px;height:4px;border-radius:99px;background:var(--line)"></div></div>
                      <div style="padding:8px 16px 16px;display:flex;gap:14px">
                        <div style="width:88px;height:88px;flex:0 0 88px;border-radius:16px;overflow:hidden;background:var(--imgbg)">
                          <image-slot id="{{ mapCardSlot }}" shape="rect" placeholder="{{ mapCardPh }}"></image-slot>
                        </div>
                        <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:7px">
                          <div style="font-size:16px;font-weight:800;letter-spacing:-.026em;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ mapCardName }}</div>
                          <div style="display:flex;align-items:center;gap:6px;font-size:12.5px;color:var(--ink2)">
                            <svg width="12" height="12" viewBox="0 0 24 24" style="color:var(--gold);flex:0 0 12px" fill="currentColor"><path d="M12 2l2.6 6.5L21 9.8l-4.8 4.4L17.5 21 12 17.6 6.5 21l1.3-6.8L3 9.8l6.4-1.3L12 2Z"/></svg>
                            <span style="font-weight:700;color:var(--ink)">{{ mapCardRating }}</span>
                            <span>·</span><span>{{ mapCardCat }}</span>
                          </div>
                          <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:auto">
                            <div style="font-size:13.5px;font-weight:700;color:var(--ink)">{{ mapCardPrice }}</div>
                            <div style="padding:9px 15px;border-radius:12px;background:var(--brandSoft);font-size:12.5px;font-weight:700;color:var(--brand)">{{ t.viewDetails }}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
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
                          <sc-if value="{{ m.hasItin }}">
                            <div onClick="{{ goItin }}" style="border-radius:20px;overflow:hidden;background:var(--surface);border:1px solid var(--line);box-shadow:var(--shadowLg);cursor:pointer">
                              <div style="position:relative;height:112px;background:var(--surface2)">
                                <div style="position:absolute;inset:0;background:repeating-linear-gradient(90deg,var(--line) 0 1px,transparent 1px 44px),repeating-linear-gradient(0deg,var(--line) 0 1px,transparent 1px 40px)"></div>
                                <div style="position:absolute;left:38px;top:34px;width:4px;height:46px;border-radius:99px;background:var(--brand)"></div>
                                <div style="position:absolute;left:38px;top:34px;width:132px;height:4px;border-radius:99px;background:var(--brand)"></div>
                                <div style="position:absolute;left:164px;top:28px;width:14px;height:14px;border-radius:50%;background:var(--brand);border:2.5px solid #FFF"></div>
                                <div style="position:absolute;left:32px;top:74px;width:14px;height:14px;border-radius:50%;background:var(--green);border:2.5px solid #FFF"></div>
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
                      <div style="position:relative;height:136px;background:var(--surface2)">
                        <div style="position:absolute;inset:0;background:repeating-linear-gradient(90deg,var(--line) 0 1px,transparent 1px 48px),repeating-linear-gradient(0deg,var(--line) 0 1px,transparent 1px 44px)"></div>
                        <div style="position:absolute;left:44px;top:38px;width:170px;height:4px;border-radius:99px;background:var(--brand)"></div>
                        <div style="position:absolute;left:210px;top:38px;width:4px;height:56px;border-radius:99px;background:var(--brand)"></div>
                        <div style="position:absolute;left:38px;top:32px;width:15px;height:15px;border-radius:50%;background:var(--green);border:3px solid #FFF;box-shadow:0 2px 6px rgba(27,20,17,.2)"></div>
                        <div style="position:absolute;left:204px;top:88px;width:15px;height:15px;border-radius:50%;background:var(--brand);border:3px solid #FFF;box-shadow:0 2px 6px rgba(27,20,17,.2)"></div>
                        <div style="position:absolute;left:262px;top:56px;width:76px;height:56px;border-radius:12px;background:var(--greenSoft)"></div>
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
                      <div style="margin-top:4px;font-size:12px;color:var(--ink3)">{{ itinWalk }}</div>
                    </div>
                    <div style="flex:0 0 auto;font-size:12.5px;font-weight:700;color:var(--ink2)">{{ itinCost }}</div>
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
                        <div style="aspect-ratio:1;border-radius:16px;background:var(--surface);border:1.5px dashed var(--line);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;cursor:pointer">
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
                        <div style="position:relative;height:112px;background:var(--surface2)">
                          <div style="position:absolute;inset:0;background:repeating-linear-gradient(90deg,var(--line) 0 1px,transparent 1px 44px),repeating-linear-gradient(0deg,var(--line) 0 1px,transparent 1px 40px)"></div>
                          <div style="position:absolute;left:40px;top:32px;width:4px;height:48px;border-radius:99px;background:var(--brand)"></div>
                          <div style="position:absolute;left:40px;top:32px;width:130px;height:4px;border-radius:99px;background:var(--brand)"></div>
                          <div style="position:absolute;left:164px;top:26px;width:14px;height:14px;border-radius:50%;background:var(--brand);border:2.5px solid #FFF"></div>
                          <div style="position:absolute;left:34px;top:74px;width:14px;height:14px;border-radius:50%;background:var(--green);border:2.5px solid #FFF"></div>
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
                        <div style="flex:0 0 auto;padding:10px 15px;border-radius:13px;background:var(--brandSoft);font-size:15px;font-weight:800;color:var(--brand)">{{ curCode }}</div>
                      </div>
                      <div style="margin-top:6px;font-size:12.5px;color:var(--ink3)">{{ curName }}</div>
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
  
                  <div style="display:flex;flex-direction:column;gap:12px">
                    <div style="font-size:16px;font-weight:800;letter-spacing:-.024em;color:var(--ink)">{{ t.convertFrom }}</div>
                    <div style="display:flex;flex-direction:column;gap:9px">
                      <sc-for list="{{ curList }}" as="cu" hint-placeholder-count="6">
                        <div onClick="{{ cu.go }}" style="{{ cu.css }}">
                          <div style="width:44px;flex:0 0 44px;font-size:13px;font-weight:800;color:var(--ink)">{{ cu.code }}</div>
                          <div style="flex:1;min-width:0;font-size:14px;color:var(--ink2)">{{ cu.name }}</div>
                          <sc-if value="{{ cu.isOn }}">
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color:var(--brand);flex:0 0 17px"><path d="M5 12.5l4.5 4.5L19 7" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
                          </sc-if>
                        </div>
                      </sc-for>
                    </div>
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
  
                  <div style="height:82px;border-radius:20px;background:var(--brand);display:flex;align-items:center;justify-content:center;gap:14px;cursor:pointer;box-shadow:var(--shadowLg)">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color:var(--brandInk);flex:0 0 26px"><path d="M6.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 4.5 5.5a2 2 0 0 1 2-2Z" stroke-width="1.9" stroke-linejoin="round"/></svg>
                    <div>
                      <div style="font-size:26px;font-weight:800;letter-spacing:-.035em;color:var(--brandInk);line-height:1.1">{{ t.call112 }}</div>
                      <div style="margin-top:2px;font-size:12px;font-weight:600;color:var(--brandInk);opacity:.8">{{ t.allServices }}</div>
                    </div>
                  </div>
  
                  <div style="display:flex;gap:10px">
                    <div style="flex:1;padding:17px 8px;border-radius:17px;background:var(--surface);border:1px solid var(--line);text-align:center;cursor:pointer;box-shadow:var(--shadow)">
                      <div style="font-size:21px;font-weight:800;letter-spacing:-.032em;color:var(--ink)">103</div>
                      <div style="margin-top:5px;font-size:12px;font-weight:600;color:var(--ink3)">{{ t.ambulance }}</div>
                    </div>
                    <div style="flex:1;padding:17px 8px;border-radius:17px;background:var(--surface);border:1px solid var(--line);text-align:center;cursor:pointer;box-shadow:var(--shadow)">
                      <div style="font-size:21px;font-weight:800;letter-spacing:-.032em;color:var(--ink)">102</div>
                      <div style="margin-top:5px;font-size:12px;font-weight:600;color:var(--ink3)">{{ t.police }}</div>
                    </div>
                    <div style="flex:1;padding:17px 8px;border-radius:17px;background:var(--surface);border:1px solid var(--line);text-align:center;cursor:pointer;box-shadow:var(--shadow)">
                      <div style="font-size:21px;font-weight:800;letter-spacing:-.032em;color:var(--ink)">101</div>
                      <div style="margin-top:5px;font-size:12px;font-weight:600;color:var(--ink3)">{{ t.fire }}</div>
                    </div>
                  </div>
  
                  <div style="padding:17px;border-radius:18px;background:var(--surface);border:1px solid var(--line);box-shadow:var(--shadow)">
                    <div style="font-size:11.5px;font-weight:700;letter-spacing:.06em;color:var(--brand)">{{ t.touristPolice }}</div>
                    <div style="margin-top:9px;font-size:19px;font-weight:800;letter-spacing:-.03em;color:var(--ink)">+996 705 00 91 02</div>
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
  
                  <div style="display:flex;align-items:center;justify-content:center;gap:10px;height:54px;border-radius:17px;background:var(--surface);border:1px solid var(--line);cursor:pointer;box-shadow:var(--shadow)">
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
                      <div style="font-size:23px;font-weight:800;letter-spacing:-.035em;color:var(--ink)">{{ fullName }}</div>
                      <div style="margin-top:4px;font-size:13.5px;color:var(--ink2)">{{ t.from }} {{ countryFlag }} {{ countryLabel }} · {{ levelLabel }}</div>
                    </div>
                  </div>
  
                  <div style="display:flex;gap:11px">
                    <div style="flex:1;padding:16px 14px;border-radius:18px;background:var(--surface);border:1px solid var(--line);box-shadow:var(--shadow)">
                      <div style="font-size:21px;font-weight:800;letter-spacing:-.032em;color:var(--ink)">{{ visitedCount }}</div>
                      <div style="margin-top:4px;font-size:12px;font-weight:600;color:var(--ink3)">{{ t.statVerified }}</div>
                    </div>
                    <div style="flex:1;padding:16px 14px;border-radius:18px;background:var(--surface);border:1px solid var(--line);box-shadow:var(--shadow)">
                      <div style="font-size:21px;font-weight:800;letter-spacing:-.032em;color:var(--ink)">{{ badgeCount }}</div>
                      <div style="margin-top:4px;font-size:12px;font-weight:600;color:var(--ink3)">{{ t.statBadges }}</div>
                    </div>
                    <div style="flex:1;padding:16px 14px;border-radius:18px;background:var(--surface);border:1px solid var(--line);box-shadow:var(--shadow)">
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
            <div style="position:relative;z-index:5;flex:0 0 auto;background:var(--surface);border-top:1px solid var(--line)">
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
                <div style="display:flex;justify-content:center;padding:4px 0 9px"><div style="width:136px;height:5px;border-radius:99px;background:var(--ink3);opacity:.5"></div></div>
              </sc-if>
              <sc-if value="{{ isAndroid }}">
                <div style="display:flex;align-items:center;justify-content:center;gap:56px;padding:8px 0 11px;color:var(--ink3)">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M15 5l-7 7 7 7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  <div style="width:86px;height:4px;border-radius:99px;background:currentColor"></div>
                  <div style="width:14px;height:14px;border-radius:3px;border:2px solid currentColor"></div>
                </div>
              </sc-if>
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
                  <div style="flex:1;display:flex;align-items:center;gap:6px">
                    <sc-for list="{{ obDots }}" as="dot" hint-placeholder-count="2">
                      <div style="{{ dot.css }}"></div>
                    </sc-for>
                  </div>
                  <div style="flex:0 0 auto;font-size:12px;font-weight:700;color:var(--ink3)">{{ obStepLabel }}</div>
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
    mapPin: 3,
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
    chatInput: '',
    speaking: null,
    phraseCat: 'hello',
    amount: '100',
    curCode: 'USD',
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

  function ask(q) {
    var query = (q || '').trim();
    if (!query) return;
    var key = D.answers[query] ? query : matchIntent(query);
    var a = (key && D.answers[key]) || null;
    var L = uiLang();
    var body = a ? aiOf(key, 'text', a.text)
      : ((L !== 'en' && D.fallbackText[L]) || D.fallbackAnswer);
    a = a || { chips: [] };
    var shown = key ? aiOf(key, 'q', query) : query;
    setState(function (st) { return { chat: st.chat.concat([{ who: 'me', text: shown }]), typing: true, chatInput: '' }; });
    setTimeout(function () {
      setState(function (st) {
        return {
          typing: false,
          chat: st.chat.concat([{ who: 'ai', text: body, chips: a.chips || [], itin: !!a.itin }])
        };
      });
    }, 950);
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
    if (step === OB_COUNTRY && state.obEditing) { obFinish(); return; }
    setState({ obStep: step + 1 });
  }
  function obBack() {
    // Back out of the first step means "cancel" when editing, rather than
    // dropping the user onto an intro splash they have already seen.
    if (state.obStep === OB_LANG && state.obEditing) {
      setState({ onboarding: false, obEditing: false });
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
      setState({ onboarding: false, obExiting: false, obStep: OB_SPLASH });
    }, 460);
  }
  // Re-entered from Profile → the row the design left inert.
  function openProfileEdit(step) {
    var p = activeProfile();
    setState({
      onboarding: true, obEditing: true, obStep: step || OB_LANG,
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
      onboarding: true, obEditing: false, obExiting: false, obStep: OB_SPLASH,
      obFirst: p ? p.first : '', obLast: p ? p.last : '',
      obCountry: p ? p.country : '', obLang: p ? (p.lang || 'en') : 'en', obQuery: ''
    });
  }
  function newProfile() {
    try { localStorage.removeItem(PROFILE_KEY); } catch (e) { /* nothing stored */ }
    setState({
      profile: null, onboarding: true, obEditing: false, obExiting: false, obStep: OB_SPLASH,
      obFirst: '', obLast: '', obCountry: '', obLang: 'en', obQuery: ''
    });
  }

  /* ── Map interaction ──────────────────────────────────────────────────
     Pan, wheel/pinch zoom and pin focus. The transform is applied straight
     to the layer rather than held in state — dragging must not re-render the
     app sixty times a second. */

  var mapView = { x: 0, y: 0, z: 1 };
  var MAP_MIN = 0.6, MAP_MAX = 2.6;

  function applyMapView(el, animate) {
    if (!el) return;
    el.style.transition = animate ? 'transform .38s cubic-bezier(.22,.7,.2,1)' : 'none';
    el.style.transform = 'translate(' + mapView.x + 'px,' + mapView.y + 'px) scale(' + mapView.z + ')';
  }
  function mapEl() { return root && root.querySelector('[data-ref="mapLayer"]'); }

  function mapZoomTo(z, cx, cy, animate) {
    var el = mapEl();
    if (!el) return;
    var next = Math.max(MAP_MIN, Math.min(MAP_MAX, z));
    var r = el.getBoundingClientRect();
    // keep the point under the cursor (or the centre) fixed while scaling
    var px = (cx === undefined ? r.width / 2 : cx - r.left);
    var py = (cy === undefined ? r.height / 2 : cy - r.top);
    // With transform: translate(x,y) scale(z), a layer point L lands at
    // x + L*z. Holding the screen point p still gives x' = p - (p - x) * k.
    var k = next / mapView.z;
    mapView.x = px - (px - mapView.x) * k;
    mapView.y = py - (py - mapView.y) * k;
    mapView.z = next;
    applyMapView(el, animate !== false);
  }

  function mapRecenter() {
    mapView.x = 0; mapView.y = 0; mapView.z = 1;
    applyMapView(mapEl(), true);
  }

  // Bring the selected pin into the middle of the visible map area.
  function mapFocusPin(pin) {
    var el = mapEl();
    if (!el || !pin) return;
    var r = el.getBoundingClientRect();
    mapView.x = r.width / 2 - pin.left * mapView.z;
    mapView.y = r.height * 0.42 - pin.top * mapView.z;
    applyMapView(el, true);
  }

  function wireMap(el) {
    if (!el || el._mapWired) return;
    el._mapWired = true;
    var drag = null;

    el.addEventListener('pointerdown', function (e) {
      if (e.target.closest('[data-h]')) return;      // let pins take their taps
      drag = { x: e.clientX, y: e.clientY, ox: mapView.x, oy: mapView.y, moved: false };
      el.setPointerCapture(e.pointerId);
      el.style.cursor = 'grabbing';
    });
    el.addEventListener('pointermove', function (e) {
      if (!drag) return;
      var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (Math.abs(dx) + Math.abs(dy) > 3) drag.moved = true;
      mapView.x = drag.ox + dx;
      mapView.y = drag.oy + dy;
      applyMapView(el, false);
    });
    function end(e) {
      if (!drag) return;
      drag = null;
      el.style.cursor = 'grab';
      try { el.releasePointerCapture(e.pointerId); } catch (err) { /* already released */ }
    }
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);

    el.addEventListener('wheel', function (e) {
      e.preventDefault();
      mapZoomTo(mapView.z * (e.deltaY < 0 ? 1.16 : 0.86), e.clientX, e.clientY, false);
    }, { passive: false });

    // double-tap / double-click to zoom in
    el.addEventListener('dblclick', function (e) {
      mapZoomTo(mapView.z * 1.5, e.clientX, e.clientY, true);
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
      tags: ['Bishkek', 'Ala-Archa', 'Burana']
    };
    var list = (state.userTrips || []).concat([trip]);
    persistTrips(list);
    setState({ userTrips: list });
  }

  function filteredCountries() {
    var q = state.obQuery.trim().toLowerCase();
    if (!q) return D.countries;
    var starts = [], contains = [];
    D.countries.forEach(function (c) {
      var n = c[1].toLowerCase();
      if (n.indexOf(q) === 0) starts.push(c);
      else if (n.indexOf(q) > 0) contains.push(c);
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
    var activePin = visiblePins.filter(function (mp) { return mp.id === st.mapPin; })[0] || visiblePins[0] || null;
    var pin = (activePin && D.places.filter(function (p) { return p.id === activePin.id; })[0]) || D.places[0];

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
      obNextLabel: st.obStep === OB_COUNTRY
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
      goMap: function () { go('map'); },
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
      pDesc: descOf(place), pAddr: place.addr, pDishes: place.dishes.map(function (x) { return term('dishes', x); }), pListTitle: listTitleOf(place.listTitle),
      pSlot: place.slot, pPh: place.ph,
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
        return { name: term('filters', mname), go: function () { setState({ mapFilter: mname }); }, css: chipCss(st.mapFilter === mname) };
      }),
      hasPins: visiblePins.length > 0,
      noPins: visiblePins.length === 0,
      mapRecenter: mapRecenter,
      mapZoomIn: function () { mapZoomTo(mapView.z * 1.35); },
      mapZoomOut: function () { mapZoomTo(mapView.z / 1.35); },
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
      mapCardName: pin.name, mapCardRating: pin.rating.toFixed(1), mapCardCat: catOf(pin.cat),
      mapCardPrice: micro(pin.price), mapCardSlot: pin.slot, mapCardPh: pin.ph,
      mapCardGo: function () { openPlace(pin.id); },

      hasChat: st.chat.length > 0,
      isEmpty: st.chat.length === 0,
      typing: st.typing,
      promptCards: D.prompts.map(function (p) {
        return { q: aiOf(p.q, 'q', p.q), s: aiOf(p.q, 's', p.s), go: function () { ask(p.q); } };
      }),
      chatMsgs: st.chat.map(function (m) {
        return {
          text: m.text, isMe: m.who === 'me', isAi: m.who === 'ai', hasItin: !!m.itin,
          hasChips: !!(m.chips && m.chips.length),
          chips: (m.chips || []).map(function (c) { return { name: c, go: function () { byName(c); } }; }),
          css: m.who === 'me'
            ? 'max-width:82%;align-self:flex-end;padding:14px 17px;border-radius:20px 20px 6px 20px;background:var(--brand);color:var(--brandInk);font-size:14.5px;font-weight:500;line-height:1.5;white-space:pre-line'
            : 'align-self:stretch;font-size:14.5px;line-height:1.62;color:var(--ink);white-space:pre-line'
        };
      }),
      resetChat: function () { setState({ chat: [], chatInput: '', typing: false }); },
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
      curList: D.currencies.map(function (c) {
        return {
          code: c[0], name: c[1], isOn: st.curCode === c[0],
          go: function () { setState({ curCode: c[0] }); },
          css: 'display:flex;align-items:center;gap:12px;padding:14px 15px;border-radius:15px;cursor:pointer;transition:all .14s;border:1px solid ' +
            (st.curCode === c[0] ? 'var(--brand);background:var(--brandSoft)' : 'var(--line);background:var(--surface)')
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
        return {
          name: term('trips', trip.name), when: term('trips', trip.when),
          cost: micro(trip.cost), time: micro(trip.time),
          stops: trip.stops + ' ' + t.stopsWord, isActive: trip.active, tags: trip.tags,
          go: function () { go('itinerary'); },
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

      visitedCount: String(D.badgeList.reduce(function (n, b) { return n + verifiedCount(b.kind); }, 0)),
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
        },
        { name: t.mEdit, meta: prof.first, go: function () { openProfileEdit(OB_NAME); }, icon: 'cog' }
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

    // The map layer is recreated whenever the screen mounts, so re-attach the
    // gesture handlers and restore the current pan/zoom.
    var map = mapEl();
    if (map) { wireMap(map); applyMapView(map, false); }

    var scroller = root.querySelector('[data-ref="scrollRef"]');
    if (prevScreen !== state.screen) {
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
    if (!saved || replay) state.onboarding = true;

    prepareTemplate();
    wireEvents();
    prevScreen = state.screen;
    draw();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
