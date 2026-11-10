# Sekampfire

## Patch #57: Bingsu portrait fits INSIDE the Pet Shop frame

- **UI-only framing correction:** The approved 94x68 Bingsu head-and-chest artwork is now uniformly fitted to an 86x62 pixel display using integer nearest-neighbor sampling. It is the **same image**, not a redrawn or newly cropped dog. The former 94x68 rendering started at the card's top edge and covered the border, making her chest touch the bottom of the frame.
- **Visible even matting:** The original 100x68 Pets card at (31,50) now draws her image at (38,53), leaving precisely 7 game pixels left/right and 3 top/bottom. A restrained slate matte backs the picture while preserving the gold selected border. The right-hand Bingsu description, three tabs, Shop close, detail area and real BUY/OWNED button remain in their existing coordinates.
- **No game changes:** Same saved 40-Ash ownership, she/her personality text, zero-collar Dogo art, 2-log retrieval, equipment UI, in-world sprite, Ash balance and run saves. Only the portrait rendering/placement changes, including a matching inset in the older detailed pet profile.
- **Regression coverage:** Tests assert the original source pixels remain available at native 94x68, confirm proportional 86x62 downsample stays inside the frame with a margin on all sides, verify a visible border and matte on the actual Shop, and preserve Bingsu's unlock and companion behavior. A real-device visual review remains pending.


## Patch #56: show more of Bingsu's approved Pet unlock portrait

- **Zoomed OUT, not redrawn:** The player liked Patch #55's gentle Dogo Argentino portrait but pointed out that the in-game image was cropped too tightly. This patch uses a wider view of the **same approved pixel illustration**, showing more of Bingsu's muscular white neck, upper chest and shoulders while preserving the face, natural ears, black nose, soft expression and entirely collar-free appearance.
- **Fits the existing Shop:** The art is now 94x68 native pixels instead of 90x68; the existing 100x68 Pet card at (31,50) already has sufficient room. The text column, tabs, close button, details inspector and actual 40-Ash BUY button are NOT moved or resized. Selecting the portrait still does not spend Ash.
- **Pixel-perfect local rendering:** The expanded crop is encoded in the existing bingsuPortrait55.ts indexed-palette Canvas renderer with a verified 44-color/68-row image, still synchronous and offline-compatible. No new images are loaded at runtime and no new UI system, save fields or source dependencies are introduced.
- **Nothing else changes:** The already-approved in-world Bingsu sprite, following/fetching two real Pine Logs, her ownership/equipped state, personality, unlocked pet abilities and all other game systems are unchanged.
- **QA:** Tests now validate the 94x68 portrait bounds, new head/chest pixel colors, full unbroken rows, fit inside the unchanged menu, collar-free palette and saved 40-Ash pet purchase. The static crop has been visually checked at native pixel scale; deployed landscape phone testing remains outstanding.


## Patch #55: Bingsu's approved head-and-chest unlock portrait

- **Replaced the rejected full-body portrait with a true 3/4 head-and-chest close-up.** The Pets Shop now uses an artistically shaded 90x68 native-pixel white Dogo Argentino portrait: Bingsu faces slightly left, with a broad black nose, gentle dark eyes, natural folded ears, strong jaw, smooth white neck and upper chest. No awkward rectangular full-body anatomy, legs, tail, collar, angry expression or generic puppy eyes. The image uses an original inspected color-indexed raster rather than the rejected polygon-based dog.
- **Visible on the real menu:** the close-up sits in a proportionate 100x68 card at (31,50) with the breed, personality and unlock/owned caption in a separate text column. Shop tabs end at y49; art ends at y118; upgrade details begin at y119. The real 40-Ash BUY action and Pet Shop tab/close controls remain unchanged.
- **Only unlock art changed:** Bingsu's previously approved compact in-world sprite, her animations, two-Pine-Log fetching, personality, purchase ID, Ash price, equipped state, game mechanics and saves are untouched. The old full-body illustration files are removed to prevent accidental reuse; this is the new single source of truth.
- **No dependency on loading images:** the original pixel art is encoded as a small static indexed palette and 68 rows of pixels rendered directly to the existing Canvas. No added external fonts, network requests, emoji, upscaling, browser APIs or save migration. Automated QA verifies exact image bounds/pixel colors, no collar, card hit zones, bottom BUY/pet ownership, and unchanged companion sprite. Real-device visual signoff is still recommended.


## Patch #54: Bingsu's actual Dogo Argentino reference-based Pets portrait

- **Replaced the Pet Shop picture, not the world sprite.** The old 54x65 front-facing pixel head made Bingsu look like a squashed white puppy. The player supplied a real side/three-quarter adult Dogo Argentino photograph. The Pets Shop now displays an original **124x65 full-body left-facing pixel portrait**, with a gentle adult face, folded natural ears, strong neck and shoulders, deep chest, long athletic torso, tucked abdomen, tall legs, natural lowered tail and broad black nose. No red collar, harness, fluff, angry expression or generic emoji.
- **Give her art room to breathe:** Enlarged the Pet Shop portrait frame to 128x66 in the existing 320x180 Shop. The story, pet name, breed and owned/unlocked information now sit in a separate right column. The bottom details panel, genuine 40-Ash BUY button, tabs, exit, Bingsu ownership and Inventory equip controls remain unchanged.
- **Real code assets, not a fake screenshot:** The new art is a locally drawn, native-resolution pixel illustration using scanline polygons and soft white shading. No reference photograph is embedded or fetched at runtime. The familiar small side-view in-world dog renderer and two-log fetching, animation, save and pet lore remain untouched.
- **QA:** Dedicated tests cover 124x65 pixel bounds, actual side-facing head and black nose, long white back and planted front/rear paws, collar-free palette, realistic Pet Shop portrait hit zone, preserved 40-Ash purchase, safe overall screen bounds, legacy portrait helper and unmodified world-sprite behavior. Real Android visual review is still recommended.


## Patch #53: Camp Legacy - permanent Ash foundations, Bingsu's personality and art

- **Camp Legacy (NEW permanent Ash upgrade):** four sequential upgrade levels, each purchased from the current banked-Ash Shop. Level 1 (35 Ash) prebuilds **Log Storage** for future runs; Level 2 (60 Ash) also prebuilds **Workbench**; Level 3 (95 Ash) also restores both **Fence Posts**; Level 4 (140 Ash) also unlocks the **Eastern Camp Expansion** at run start. Total investment across all four levels is 330 banked Ash. The Shop's Legacy card shows the **next actual benefit** and the real next-level cost.
- **Only buildings carry over:** Purchased Legacy applies when starting a genuinely new run, never retroactively to the active run or an older resumed run checkpoint. It does NOT grant logs, stored resources, fire fuel, lit torches, station upgrades, crafted equipment, earned Run Ash, Museum discoveries or completed tutorial missions. Built stations start empty. Prebuilt fence objectives are naturally satisfied by their actual built state, but Grooty's remaining tasks still need to be completed.
- **Seven readable upgrade cards:** the Shop now has six normal-sized cards per page with a small labelled 1/2-page indicator and safe Prev/Next controls in the details header. The seventh Camp Legacy card has its own page. Touching a card or navigating pages never purchases it; only the separate BUY action spends Ash after revalidating cost, banked balance, level and maximum. No narrower icons or overlapping buy/card hit zones.
- **Bingsu is a sweet, calm, loving Dogo Argentino:** she is always ready for hugs, rarely barks, has a stubborn streak, and would fight to the death for her person. Her Pet Shop and full profile now express that personality. The personal real-life inspiration is not mentioned anywhere in the game. This is character lore, NOT a new combat/guard mechanic.
- **More recognizable adult Dogo art:** redo the hand-painted 54x65 pixel portrait around a large square white head, powerful cheeks, natural hanging ears, almond eyes, broad black nose, deep chest and muscular shoulders. The small side-view dog also has a more athletic adult chest and uncropped hanging ear. No collar, no harness, no angry snarl, no extra sprites, and no change to Bingsu's authentic two-log retrieval or movement.
- **Compatibility and QA:** new permanent ownership lives in the existing `up.legacy` map and is sanitized by the unchanged meta loader. Existing run checkpoint key/version, Ash and previously bought upgrades are preserved. Patch #53 adds tests for all Legacy tiers, price progression, no free resources or retroactive structures, safe legacy load, Shop pagination and Bingsu lore/art. A real landscape Android visual and progression-balance review is still needed.


## Patch #52: Pine burn values and one-log campfire ignition

- **Light with ONE real Pine Log:** Every unlit campfire now needs exactly 1 Pine Log, whether it is the first fire of the run or a later relight. Previously the first ignition cost no wood and later relights cost 3. Carry the log or take it from built Log Storage, select the fire using ACT and use LIGHT. With no log, the fire stays unlit and the initial tinder remains available. The permanent **Old Flint** Ash upgrade still starts future runs with a pre-lit 40-fuel fire and 2 carried Pine Logs, preserving the purchased benefit.
- **Random Pine firewood:** Each actual Pine Log now adds a uniformly rolled integer **5-20 fuel** when used at the fire. The value is rolled when the log is consumed, not when chopped, collected, stored or saved. Carrying weight remains 1 kg per log, the Pine inventory remains one normal stack, and the source registry in `src/game/firewood52.ts` is ready for later genuine wood species. No invented new tree species, fake resources or quality metadata are introduced.
- **Starter tinder makes the first fire practical:** First-time starter tinder adds **+20 one-time fuel** to the Pine Log's 5-20 value, so the very first manually lit fire begins with 25-40 fuel. The tinder is NOT a free log and is consumed only on successful first lighting. All later relights use just the log's 5-20 value. This maintains an approachable first ignition while removing the expensive three-log relight.
- **Kindling and fuel accounting:** The existing crafted Kindling Bundle now correctly adds **+5 extra fuel to each rolled log**, rather than replacing its fuel gain with a fixed 21. A full (99+ fuel) fire rejects fuel with no log or random roll spent; any successful fuel gain stays within the same 100 capacity. Lit-fire feeding increments Grooty's separate FEED mission; initial lighting does not falsely complete it. Weather, Fire Reflector, station upgrade burn reduction, player warmth, and torch consumption rates are unchanged.
- **Clear gameplay help:** The beginner tutorial, Grooty's one-log lighting hint, on-screen logs inventory label, and actual fire action messages explain 1-log lighting and the Pine 5-20 fuel range. The log's true granted fuel and optional tinder/Kindling bonus are announced after consumption.
- **Saves and tests:** No new run save key/version or extra individual log data. Existing `player.wood`, inventory stack, storage, Bingsu retrieval, Museum discoveries and Ash remain intact. The new tests cover the inclusive 5-20 range and all 16 possible values, no-free-light edge cases, exact single-log conservation, Kindling +5, first-tinder bonus, re-lighting from storage, fuel capacity, old v1 checkpoint resume, Old Flint and unchanged ambient fuel drain. The variable-fuel early-game balance still needs playtesting on a real phone.


## Patch #51: pixel-art Ash Shop cards, explicit BUY and Bingsu art correction

- **Actual Ash upgrade cards:** Six permanent upgrades are now illustrated with six original native-pixel icons, laid out in a balanced three-column, two-row grid. The Pets tab has Bingsu as a separate, larger portrait card, and the neutral Coming Soon tab remains. All three header tabs and the close button retain nonoverlapping hit zones, with the same 320x180 world canvas and translucent sky-visible overlays.
- **Select, inspect, then BUY:** Tapping a card *only* selects it; the bottom detail panel shows the owned level, real next level and the verified permanent benefit. One distinct bottom-right BUY button spends **banked Ash** using current balance, current level, real config cost and max-level cap. Insufficient or maximum-level items can still be inspected but cannot be bought. Selecting a card, switching tabs or closing Shop never spends currency. Keyboard Up/Down selects and Enter/Space buys the selected upgrade.
- **Unchanged prices and ownership:** Warm Blood remains 12/26/45 Ash, Old Flint 14, Big Backpack 16, Grandpa's Axe 20, Blueprints 22, Everwarm Scarf 30, and Bingsu 40. The purchase routine refreshes live values before spending, prevents duplicate/stale purchases, saves the same permanent meta keys, and preserves Bingsu's Inventory-only equip/unequip introduced in #50. Earned Run Ash cannot be spent until banked.
- **Bingsu is a girl:** Her permanent profile, Pets Shop portrait and in-world artwork now represent a **female Dogo Argentino**. Her coat and muscular neck are entirely white, with **no red collar, tag, or harness**. The portrait has a stronger square jaw, broad chest, natural folded ears, short muzzle and black nose instead of a generic puppy silhouette. Visible text uses **she/her**. Her #49 following, smooth animation, real two-log retrieval and ownership are unchanged.
- **Regression tests:** Patch #51 verifies native card geometry, pixel icons, mobile touch selection without spending, disabled buy targets for insufficient Ash/owned levels, precise per-level purchases, no accidental use of Run Ash, keyboard selection, true 40-Ash Bingsu purchase, collar-free portrait/world pixels, and safe menu close/tab targets. Android landscape art review remains to be done.


## Patch #50: backpack plus real Axe and Pet equipment

- **One wide inventory, two simultaneously visible regions:** the existing 20 backpack item slots remain on the left, with the same 5/10/15 unlocked slot progression and 5/13/21 kg carrying limits. The right side permanently shows two genuine equipment sockets for **AXE** and **PET**. Selecting either displays only gear actually owned, its ability, and a separate **EQUIP/UNEQUIP** action; no need to switch to an obsolete full-screen Equipment tab. Ineligible gear cannot be equipped.
- **Permanent Stick:** every player always owns the original Wood Stick. Unequipping a Wood Axe or Grandpa's Axe falls back to Stick; the Stick itself never disappears, consumes backpack slots, or gets discarded. Existing owned equipment is never lost through unequip.
- **Chopping follows the equipped axe:** Stick 1.00 second, crafted Wood Axe 0.70 second, permanent Grandpa's Axe 0.55 second per chop. Owning multiple axes no longer multiplies their effects. The *same* equipped tier controls the displayed chopping tool and the actual chop duration; changing equipment cancels an unfinished chop rather than swapping blades mid-swing. Crafting an axe and purchasing Grandpa's Axe still auto-equip it once, preserving familiar progression.
- **Bingsu is equipped from Inventory:** the Pet socket displays Bingsu if bought; selecting him and pressing EQUIP/UNEQUIP updates the same permanent `petEquipped` setting already used by the companion. She still fetches a maximum of two **real** dropped Pine Logs; unequipping safely returns or holds his cargo, with no fabricated wood. The Pets Shop becomes an unlock/ownership display, not a second competing equip interface.
- **Existing Quick Slots preserved:** the Inventory's **TOOLS** option retains the old ability to assign a genuinely crafted Ember Torch directly to Quick Slot 1 or 2. Holding the two HUD quick slots still works. Existing crafted Boots, Pack, Kindling and other owned gear remain visible there without inventing new bonuses.
- **Safe legacy migration:** existing v1 run snapshots without an axe selection automatically equip the strongest owned axe on resume; snapshots with an explicit Stick choice respect it. The saved run adds only the optional validated `equippedAxe` ID, keeping the v1 key/version and canonical Pine Log stacks. Grandpa's Axe or Stick is remembered as the permanent new-run preference, but the crafted Wood Axe never leaks across runs. Existing `up.axe`, `up.dog`, Ash, purchases, collectibles and all logs are preserved.
- **QA:** Patch #50 includes regression tests for shop ownership, safe legacy load, no item forging, actual chopping duration, UI hit targets and safe layout bounds, equip/unequip interactions, two-log pet conservation, and retained torch quick-slot assignment. Real Android landscape visual signoff remains outstanding.


## Patch #49: Bingsu's world sprite and companion motion rebuilt

- **Proportionate white Dogo Argentino:** Replace the oversized 30+ pixel-wide Bingsu in-world artwork with a compact, original ~23x15 native-resolution pixel sprite (including tail and carried logs), compared with the player's ~25-pixel height. Her square muzzle, folded ear, short white coat, natural white neck, dark nose and one/two REAL Pine Logs remain recognizable. The enlarged permanent Shop portrait is not resized.
- **Grounded animations:** Both dog and player stand on the same world-space foot baseline. Walking legs use the actual distance traveled, rather than a time-dependent two-frame flip that kept sliding. Idle breathing, short tail movement and an occasional blink remain subtle, with correctly mirrored art and planted paws at rest.
- **Natural follow behavior:** Bingsu stays on the side of the player where she already is. Turning around does not instantly send her across the player. World-space follow range has a 17px relaxed idle band, a 13px following separation, a bounded catch-up speed, and a real pickup leash. An exceptional large teleport/resume is the only case that snaps him back into view.
- **Does not abandon player:** Bingsu fetches only actual existing dropped logs, maximum two. She visits the built rack only while his owner is nearby. Otherwise she follows while carrying and hands the logs off when there's bag space. Unequipping, full storage, and a saturated pickup array conserve every carried log.
- **Old save compatibility:** No change to run-save or permanent Ash keys, Bingsu's `up.dog` ownership bit, 40-Ash purchase, inventory, wood count, or current pet equipment state. The restored dog sprite starts on the same ground line and derives its gait as transient animation state. The next patch handles the new inventory-based pet/axe equipment UI.
- **Regression coverage:** Patch #49 tests validate the world sprite's bounding box, left/right mirroring, actual gait stepping, idle stance, stable following during player direction changes, pickup and camp leashes, conservation of wood on unequip and v1 checkpoint restoration.
- **Device follow-up:** Pixel silhouette and behavior are source-verified and regression-tested; a real 320x180 landscape phone view is still needed to approve Bingsu's final size, body shading and walk timing.


## Patch #48: real fence-corner torches, clean night lighting, Log Storage TAKE

- **Fix unexplained lights:** The camp-upgrade renderer previously cut two unearned light holes into the night mask at stage 6 and added three invisible quarter-way "lights" across the fenced interior. Those are removed. Night-mask openings now come only from real, visibly burning Campfire, handheld torch or **built, active physical fence torches**. The fence glow stays pale/cool compared with the campfire.
- **Keep every fence corner after expansion:** Once the original west and east posts are built, expansion retains the old east junction post and adds a THIRD outer east post. All three are visible on the palisade/minimap and can each take their own **2-log torch**, with independent seven-dawn timers and rebuild costs. A torch already built on the old eastern post **does not move when you expand**. Protection applies to each lit post's nearby ground and each fenced segment with two lit endpoint torches; full expanded-camp protection requires the new outer torch too.
- **Safe P47 save migration:** P47 two-key saves from *already-expanded* camps had their eastern torch visually on the outer boundary. On first resume its unexpired timer transfers to the new outer post, while the original east junction becomes available for a new one. This runs only when the old optional `outer` key is missing and never duplicates a torch. Run save key/version and banked Ash remain unchanged.
- **Separate TAKE at Log Storage:** ACT still requires selecting the finished storage once. The left floating button always **STORE**s carried logs; a new center **TAKE** button appears whenever the storage contains logs, even while carrying logs; right **UPGRADE** remains. Taking respects the actual 5/13/21 kg backpack limit, storing respects the real pile cap, and neither direction can silently reverse. A live `7/12 LOGS`-style readout sits below the floating **LOG STORAGE** title; its nearby world label also shows the count.
- **Regression coverage:** New Patch #48 tests verify the stationary old junction, three torch placements and expiry, old-save migration, true light-only cutouts even at max camp stage, segmented shelter, 3-circle hit zones, actual Take/Store transfers, capacity, ACT semantics and storage count.


## Patch #47: small Ash Shop button, temperature, Museum gate, fence torches and sky-visible UI

- **One-line Ash button:** The upper-right Ash plaque is now a smaller single-line button directly below MENU, aligned with its right edge. Tapping opens the existing real Shop tabs (Upgrades/Pets/Coming Soon), where only **banked Ash** can be spent. Earned Run Ash remains unbanked until End Run or Level completion. It briefly highlights when tapped. Compact numbers are truncated rather than rounded upward, and smaller balances are shown in full when they fit.
- **Cleaner pause menu:** The redundant Toolbar entry is removed. The two functional quick slots remain visible in the river HUD; holding a slot or assigning a crafted Ember Torch from Inventory remains supported.
- **Cold matters:** The **actual local air temperature** now increases warmth loss below +8°C, reaching a capped 1.72x ambient factor during deep freezes. This complements the existing weather-dependent Cold exposure, while campfire heating, Warm Blood, torches, boots and shelter still work.
- **Museum discovery lock:** The first **Ordinary Log** can be recognized before construction, but **Twisted/Hand/Figure-8 collectible logs cannot be discovered until the permanent Log Museum has been built**. Old already-earned Museum collectibles stay owned.
- **Seven-dawn fence torches:** Once both camp posts are built, visit either **physical fence post**, carry **2 Pine Logs**, and press ACT to build a small permanent-mounted (but run-temporary) cool-glowing torch. Each side has its own countdown of **seven completed dawns**, is saved with the existing v1 run, and can be rebuilt for another two logs once burned out. One torch prevents warmth drain near its own post; **both lit torches prevent warmth loss throughout the claimed camp interior** (not beyond the fence). They do not regenerate Warmth as the central campfire does. When the fence expands, the right-mounted torch follows the actual relocated east post.
- **Softer visual language:** HUD frames, Menu/ACT buttons, quick slots, backpack button, pause/Shop/crafting/inventory/Grooty/Museum panels and event messages use more transparent backgrounds so seasons, weather and the real sky remain visible. Text contrast and action hit zones are kept.
- **QA:** The Patch #47 suite covers genuine temperatures, Museum eligibility, seven-dawn expiration, torch construction and save migration, native light colors, Ash Shop hit targets, quick-slot continuity, and translucent UI. Android landscape testing remains outstanding.


## Patch #46: choose a station, then use floating circular controls

- **ACT selection:** merely approaching a built Campfire, Workbench or Log Storage shows no floating action circles. **First ACT selects that nearby structure** and reveals its controls; **second ACT performs its left/default action**, as do subsequent ACT presses while the selection stays in range. The central ACT label changes to LIGHT/FEED, CRAFT, or STORE/TAKE when selected.
- **Circular, semi-transparent pixel-art controls:** replaces square station buttons with gentle bobbing pixel circles. Original icons, readable short labels, proper animated touch zones and matching Grooty fireflies remain tied to the selected station. Station selection/upgrade confirmation closes on departure, opening another menu, or finishing an interaction that opens a detailed screen.
- **Ash under Menu:** the Run Ash balance moves out from under the Weight plaque and into a two-line 32x22 panel directly beneath the top-right MENU button (same horizontal alignment), with existing compact large-number formatting. Weight and its real kg capacity are unchanged.
- **Compatibility:** no change to save keys, carried log mass, Ash accounting, station resources, camp upgrades or upgrade double-confirmation; transient station selection is never persisted.
- **QA:** Patch #46 regression suite checks first-vs-second ACT, real log feeding/upgrades, disappearance on departure/menu, float geometry, live hit zones, guide targeting and exact Ash panel position. Android landscape visual testing remains outstanding.


## Patch #45: fast backpack, true kg weight and proximity camp actions

- **Bottom-right BAG:** An original pixel-art backpack button opens the existing Backpack and Equipment inventory in one tap from the run. The top resource plaque is read-only and the redundant Pause Inventory entry is removed; the keyboard I shortcut remains. The touch rectangle takes precedence over the right-side 15% movement region.
- **WEIGHT instead of INV:** The top plaque reports carried kilograms and actual carrying capacity instead of occupied inventory-stack slots. Pine Logs already weigh **1 kg each**, so 0/5KG becomes 3/5KG after collecting three logs. Existing pack tiers remain 5/13/21 kg; the separate Ash balance sits directly beneath the Weight plaque.
- **In-world station interactions:** Walking near a completed Campfire, Workbench or Log Storage automatically reveals pixel-art action buttons above that station, with no interrupting station modal. The left action is also triggered by ACT: light/feed the fire, store/take logs, or enter real Workbench crafting. The right up-arrow improves the station using the **existing two-step confirmation** and costs. Workbench gets a small third Plans button for real physical construction.
- **Safety and guidance:** Buttons appear only within the old 22px station reach, disappear on departure or when a menu opens, and use the existing authoritative resource/upgrade logic. Grooty's fireflies target the real inline buttons. Workbench recipe/build lists remain dedicated menus because they need full details; no other game progression or save format was changed.
- **Validation:** A new Patch #45 test suite covers weight, touch-zone priority, direct ACT, fire/storage/crafting, upgrades, nearby prompts and guide markers. Android landscape visual and gameplay review remains to be completed.


## Patch #44: Level 1 completion, verified Ash sources, and Level 2 unlock

- **Real Level 1 ending:** newly started campaign runs use the first three Grooty milestones as **The First Settlement**. Completing the Workbench milestone freezes the run at a dedicated completion screen, without starting the old cabin lessons or Long Night automatically. Already-saved pre-#44 runs retain their legacy five-group/cabin/Long Night path.
- **Actual Ash rewards:** the result screen itemizes Ash from survived dawns, aurora nights, completed structures and station upgrades. The same real award logic is now recorded through one bounded ledger; previously earned but untracked Ash is labeled **Earlier Run Ash**. No invented completion bonus or altered prices.
- **Intentional banking:** **BANK ASH + FINISH LEVEL** deposits exactly the pending Ash, ends the run, preserves permanent purchases/collections, unlocks Level 2, and shows a banked confirmation with replay, Shop and Main Menu. Neither opening the completion screen nor merely winning a milestone banks Ash.
- **Level 2 status:** the permanent unlock is saved and displayed on the title and confirmation screens. Level 2 gameplay is **not yet implemented** and is explicitly labeled Coming Soon until its missions/Ash-preserved structures are developed.
- **Safe saves:** unchanged `sekampfire-run-v1`/meta keys with optional campaign fields, validated Ash ledger, pending Level 1 choice and a stored run receipt to prevent double payment after reload. Browser refresh resumes the unbanked completion screen.
- **Controls/tests:** touch and Enter bank the pending reward; banked screen supports replay, Shop, Main Menu, and keyboard M. Regression coverage includes source accounting, older saves, pending snapshots, bank callback and display geometry. On-device QA remains outstanding.


## Patch #43: First Settlement milestone foundation and night scouting

- **Level 1 foundation:** Grooty's first three existing run-local teaching groups are now presented as the three milestones of **The First Settlement**: Establish & Explore, Log Storage and The Workbench. The two existing later cabin lessons remain explicitly labeled **Camp Challenges** during the transition; they have not been silently converted into separate campaign levels.
- **Actual first mission:** approach Grooty in the world and press ACT to talk before chopping. The small ? shortcut remains available for help without pretending the player physically met him.
- **Night exploration:** after claiming the camp and stoking the fire, follow fireflies to a small handcrafted Pine Grove marker east of the original fence during an actual night, then return to the campfire and survive until dawn. Leaving before night does not count; missing a night does not reset the run. The fireflies guide outward and back instead of pointing at the fire all night.
- **Compact guide:** Grooty's modal displays Level 1 / Milestone 1-3, the current mission checklist and concise hints. Long checklists reveal a six-row window centered on the next unfinished task, preserving the 320x180 layout.
- **No save reset:** optional run-local `guideTalked`, `scoutVisited` and `scoutReturned` values are persisted in the existing v1 run checkpoint. Previously completed guide groups remain completed. The existing five groups, camp economy, Long Night and Ash banking are not rebalanced in this patch.
- **Tests:** new scouting, wayfinding, missed-night, NPC interaction and save-snapshot coverage, plus adjusted earlier tutorial assertions.
- **Next:** Patch #44 should design and implement true Level 1 completion, Ash itemization, unlock state and clear transition to Level 2 without confusing them with the retained Camp Challenges.


**Future designs and brainstorming:** [Ideas and Design Decisions](docs/IDEAS.md). This is a planning document, not a list of implemented features.

## Patch #42: Physical camp station interactions and upgrades

- **No remote building:** BUILD has been removed from the Pause menu and the B keyboard shortcut. Building plans are obtained only by physically visiting the **completed Workbench**, using ACT and choosing **BUILD PLANS**. The plans view lists the next camp structure and Log Museum; its old remote station-upgrade tab no longer exists.
- **First structures remain possible:** The unfinished Workbench and Log Storage still accept the same 15 Pine Logs directly at their world sites. Placing camp boundary posts, founding the camp, delivering resources and hammering do not require already owning a Workbench.
- **Local ACCESS / UPGRADE popup:** ACT beside a completed Workbench, Log Storage or the Fireplace opens a small original pixel-art panel showing its level, next benefit and next Pine Log cost, with separate ACCESS and UPGRADE buttons. The Workbench also has BUILD PLANS.
- **Real ACCESS interactions:** Workbench opens the same Tools/Supplies crafting recipes. Log Storage deposits or withdraws actual carried Pine Logs. Fireplace lights, relights or stokes the same fire. A pre-existing edge case is fixed: one carried plus two stored Pine Logs can correctly pay the three-log relight cost.
- **Upgrades only at stations:** Each station's UPGRADE button requires two deliberate presses to confirm, costs the original wood amount, grants the existing +2 Run Ash and preserves level 0-2 effects and save state. Crafting no longer duplicates the Workbench upgrade.
- **Safe navigation:** X, Back and outside press close the local popup; closing Crafting or Build Plans returns to that Workbench popup. Other gameplay buttons cannot be triggered through open menus. Grooty's mission hints and firefly targets now point to the physical station, the correct popup action or the relevant Workbench plan.
- This changes no persistent run save version, existing Ash rewards, Log Museum ownership, Bingsu or backpack equipment.

## Patch #41: Square quick slots, Bingsu and Grooty's missions

- **Small square tool slots:** both water-side tools are custom 22x22 pixel-art sockets with larger 28x26 invisible touch targets for Android. Neither overlaps the unchanged central ACT button. Short tap uses the tool; hold 0.5 seconds for the picker. Existing slot-1/slot-2 keys and legacy Ember assignments remain valid.
- **Craftable Ember Torch:** a reusable torch costs 3 Pine Logs at the built Workbench (Supplies tab). Crafting adds a real owned `ember_torch` item to the Equipment inventory. Choose SLOT 1 or SLOT 2 from its item details or assign from the tool picker. It lights using the **existing** nearby lit campfire fuel/ember rule, not free fuel. The separately crafted Ember Lantern still extends the torch duration as before.
- **Bingsu:** the permanent pet previously labeled Good Dog is now **Bingsu, a Dogo Argentino**. The Pets tab adds a detailed original pixel-art portrait and short backstory, and the in-world pet is redrawn with a sturdy white coat, dark nose, folded ears and personal collar. He is loyal, fearless and ready to risk everything for his owner. His **actual implemented ability** remains fetching and carrying up to two **real** dropped Pine Logs. Combat protection is character lore, **not a shipped combat feature**. Existing ownership is kept at `up.dog` and `petEquipped: dog` with the same 40-Ash cost.
- **Grooty's tutorial text:** the run-local teaching steps now display **MISSION 1, MISSION 2, etc.**, including completion announcements, checklist headings and cabin prerequisite labels. Internal `guideLevel` saves and all existing objectives stay untouched; **actual station upgrade levels** retain their correct level numbering.
- No unrelated gameplay economy, Ash banking, inventory data or campaign level restructuring was introduced.

## Patch #40: MMO-style inventory and Pine Logs

- **Inventory window:** tap the INV panel at the top of the run, press I, or use Menu > Inventory. An original pixel-art backpack window has Backpack and Equipment tabs, 5x4 selectable slot grid, crisp log/axe/boot/pack item icons, quantities, descriptions and item weight. The open inventory blocks all gameplay underneath; X/Back/I/outside tap closes it.
- **Actual item stacks:** the starting material is Pine Logs harvested from Pine Trees. A stack of logs occupies one item slot. The backpack starts with 5 unlocked slots; the crafted Timber Pack and permanent Big Backpack each add 5 (up to 15 initially). The HUD INV display now means occupied/unlocked slots.
- **Weight is separate:** each Pine Log weighs 1. The old 5/13/21 log carrying limits remain, alongside unchanged collecting, wood storage, stoking, building, crafting and dog carrying behavior.
- **No parallel log counters:** legacy gameplay reads/writes player.wood through a direct accessor onto the real inventory Pine Logs stack. Equipment shows only existing legitimately crafted gear rather than inventing owned items.
- **Compatible saves:** version-one run snapshots save validated item stacks as well as the legacy wood field; old saves load automatically. Ash economy and achievements are unchanged.
- Future patches: smaller square quick slots with active item assignments, new resource types, and physical building ACCESS/UPGRADE popups.

## Patch #39: Four-panel HUD, local temperature and inline weather

- **Four low-profile wooden HUD plaques:** Warmth/Fuel | handcrafted local thermometer (+8°C | WINDY on one line) | INV 0/5 and earned Run Ash | Day/season/Menu. The original 23px HUD band and top minimap remain unchanged; the menu button retains its touch target.
- **Temperature + weather together:** weather labels now appear inline with the Celsius reading, never below it or beside DAY. The detailed brass-and-glass thermometer is redrawn to fit the smaller center panel while preserving its animated liquid, engraved ticks and subtle glints.
- **One local-air thermometer:** outside season/time/weather still determine world air, but standing near a lit fire now raises the air temperature around the character. Heat falls with real world distance and fuel; readings settle smoothly. This does not change the existing Warmth, Cold exposure or weather-balancing rules.
- **Compact inventory/Ash panel:** INV temporarily reports **actual wood carried / existing carrying capacity**, not invented slot occupancy. The next inventory patch will replace the wood-only calculation with the real MMO-style inventory slots and items. ASH displays earned Run Ash without banking it; banked Ash, save format and rewards are unchanged.
- The planned subsequent steps are proper item inventory/Pine Logs, smaller square quick slots, and physical crafting-station construction with ACCESS/UPGRADE building popups. These remain separate patches.

## Patch #38: Longer thermometer, living settlement minimap and toolbar foundation

- **Thermometer polish:** extend the original brass/glass thermometer's scale, liquid tube, graduations, glint range and end cap to occupy almost all 105 pixels of the existing central panel. Air temperature, Warmth and Cold gameplay remain unchanged.
- **Rich, real-world minimap:** show the camera footprint, Grooty, both individual fence posts, completed and extended palisade, future expansion marker, unfinished workbench/storage sites, constructed workbench/storage, shelter stages, permanent Museum, forest and campfire. All indicators use actual run coordinates and state; no new map buttons or additional HUD height.
- **Two quick slots** replace the permanent BUILD and TORCH water-side buttons while keeping ACT and movement arrows unchanged. Both start empty; **hold a socket for half a second** to open its assignment menu, **tap** to use its assigned action. New one-pixel equipment socket art sits over the river.
- The only supported active action so far is the **existing Fire Ember**, learned once the campfire has been lit. It still uses the real campfire fuel and duration rules. It is *not* presented as a manufactured inventory torch or an invented extra resource; further active tools will be added with the proper inventory patch.
- **Historical #38 behavior (superseded in #42):** BUILD was briefly available under Menu or the B shortcut. It is now accessible only through the physical Workbench. MENU > TOOLBAR still configures both quick slots.
- Run snapshots persist a validated two-slot array in the unchanged version-one format; older runs start with empty slots. Long presses do not trigger the corresponding quick-slot action, and moving a finger off the socket cancels the press.
- **Historical #38 guide path (superseded in #42):** Grooty now points at the actual physical station and popup actions instead of the old Menu > Build row.

## Patch #37: Handcrafted living thermometer HUD

- **Real-looking ambient air thermometer:** the center wooden HUD panel is now a dedicated original 320x180 pixel-art instrument: carved "AIR TEMP" label, brass tube and bolts, glass glints, bulb reservoir, engraved tick marks and a Celsius reading with a custom degree glyph.
- **Beautiful but restrained motion:** colored liquid smoothly settles as the real world changes between seasons, day/night and weather; small glass glints and subtle frosty/honey accents bring the instrument to life.
- **Outside temperature isn't your personal Cold meter.** Gear, fire and Ash upgrades don't change displayed °C, while the hidden environmental Cold pressure still controls actual warmth drain. No weather, survival rate or save-version changes were made.
- **Clean HUD:** the left panel again shows only spacious Warmth and Fuel meters. Removed WOOD and RUN ASH from the center panel entirely. Wood remains available via Build/Craft interactions while the real inventory is planned. Run Ash remains visible in the Pause menu and end-of-run screens.
- **No new image assets, overlays or UI hit zones.** Pixel details stay inside the existing 105x23 central panel with translucent wood framing.
- Thermometer animation state is temporary and recalculated on loading existing runs; old version-one saves remain compatible. Real Android appearance still needs screenshot review.

## Patch #36: Cold exposure, rain dampness and Warm Boots

- **Cold is exposure pressure, not another health pool.** The top-left translucent HUD now shows WARMTH / FUEL / COLD in its original 109x23 panel, without covering any additional world scenery.
- A single environmental Cold calculation now drives ambient warmth loss. Clear daylight is mild, nights colder, rain/wind/cold snaps/blizzards raise pressure, and winter adds modest seasonal exposure. This **replaces** the previous direct storm damage bonuses to avoid stacking penalties twice.
- **Rain gradually increases dampness** when outdoors; shelter under the existing Lean-to and standing near a lit fire help dry the player. Dampness contributes to Cold rather than introducing a third meter.
- Existing craft **Warm Boots** now reduce Cold by 12 exposure points, retaining their original walking-speed advantage and saved item ID.
- **First night is gentle** (clear or windy only) to leave room to learn travel and camp management. Grooty briefly explains the new Cold bar at first nightfall.
- Warm Blood, torch protection, cabin insulation and eight-second gradual fire warming remain intact. Existing weather fuel consumption rules are unchanged.
- Optional `cold` and `dampness` fields extend the existing version-one run checkpoint; older checkpoints derive safe starting exposure without losing progress.
- Actual standalone snow weather, advanced clothing/inventory and the full Level/Milestone/Mission campaign remain separately planned rather than quietly added in this patch. Android visual readability and survival balancing still require human playtesting.

## Patch #33: Grooty's fireflies and progressive fire warmth

- **Fire warmth absorbs over time:** staying near a lit fire gradually increases recovery from roughly +2 to +8.5 warmth/s over 8 seconds before cold drain; brief walks away smoothly lose the buildup, and the Log Bench / Fireplace upgrade bonuses still apply.
- **Contextual firefly guide:** a tiny yellow-green firefly cluster and bobbing pixel arrow highlights only Grooty's next unfinished task, drawn from the current tree, camp post, fireplace, storage, workbench or interface state. Distant targets have a minimap marker.
- **Menu guidance:** once resources are ready, the same marker can lead into BUILD, its proper tab and specific upgrade/structure row, or the workbench's Tools/Timber Pack recipe. All markers are decorative and introduce no new touch zones.
- **Level 2 teaches storage before expansion** while preserving the existing five-level run-local structure. Grooty's dialogue remains the complete objective list: no extra HUD banner.
- **Settings > Guiding Fireflies:** on by default, can be switched off. The preference persists under the original metadata key, and heat soak resumes from existing v1 run checkpoints without a save version change.
- Original programmatic 320x180 pixels only, no external game art or change to Ash/balance beyond warmth.

## Patch #32: Modal controls, fence clarity and translucent HUD

- **Strict modal input:** an open menu consumes all taps inside its own panel, and never sends them to buttons on the title screen or gameplay behind it. Only tapping outside the panel, its explicit X/Back control, or the keyboard Escape/Back closes it.
- **Independent mode help:** locked Endless Night continues to open its own Coming Soon explanation; the How to Play button cannot activate through this modal.
- **Cleaner fence posts:** widened real-tree exclusions to account for canopy width. Wood drops near physical fence markers are moved just outside the fence without changing resource quantities; cleared expansion trees also drop ordinary collectible wood beyond newly claimed ground.
- **More transparent top UI:** lighter translucent charcoal panels retain the pixel-font contrast and wooden framing while allowing more of the scenery to show.
- No changes to Ash, tutorial levels, pet behavior or survival difficulty.

## Patch #31: Claim and expand your camp

- **First Camp:** Grooty teaches you to chop a tree, place one real log at the western boundary post and one at the eastern post. When both are built, a handcrafted wooden palisade appears behind the camp.
- **Building gate:** Structure construction and station improvements become available after the two posts are built. Lighting the starter campfire remains possible while claiming land.
- **Eastern expansion:** in tutorial Level 2, spend five actual logs at the eastern expansion marker to extend the palisade and clear more territory. Trees stop respawning inside claimed land, and existing trees within newly claimed ground become ordinary wood pickups.
- **Camp organization:** Grooty, workbench, fire and storage remain near the center; the permanently collectible Log Museum is moved into the eastern expansion and unlocked for purchase there. Already-owned Museums remain owned and visitable.
- **Run-local:** fences and expansions reset each new run. Version-one run checkpoints keep progress, and previously upgraded/crafted camps from older saves are grandfathered into the first fence without losing buildings.
- **Visual:** original procedural pixel fencing, pointed varied planks, timber crossbeams, posts and subtle cleared ground. All drawn behind existing camp objects, player and wildlife. No collision changes or imported game graphics.
- Real-device Android appearance and tutorial pacing still need playtesting.



A cozy survival pixel-art game built with Canvas 2D, React and TypeScript. Gather wood, keep the fire burning, build a camp and survive the Long Night.

**Play:** https://sekafaji.github.io/Sekampfire/

## Patch #28: Endless Night mode preview (locked)

- The title screen now has a subdued **ENDLESS NIGHT** button directly above **HOW TO PLAY**.
- Tapping it opens a short **COMING SOON** explanation for a possible future standalone survival mode. It does not start gameplay, unlock content, spend Ash or modify saves.
- The existing campaign, its finite Long Night finale, the win/bank choice and optional **Continue Surviving** are unchanged. Endless Night is a separate mode proposal whose rules are still being designed.

## Patch #29: Real-game HUD refinement

- The gameplay minimap is now a **thin, full-width wooden-framed strip**, still driven by the actual world, trees, player, camp structures and fire.
- **Three compact resource panels** sit directly below the map: warmth/fuel, wood/Run Ash/storage, and day/weather/season with Menu.
- The existing **single top-center message** and Grooty `?` shortcut keep their previous interaction positions while picking up warmer colors to match the HUD.
- **Build / ACT / Torch controls** get a restrained wood-and-charcoal pixel-art finish; their mobile touch hitboxes stay exactly the same.
- Drawn with Sekampfire's existing 320x180 canvas renderer and pixel font. No generated scenery, replacement game sprites, gameplay balance changes or save migration.
- Automated geometry checks cover the minimap and control positions; final Android visual approval is still needed.

## Patch #27: Grooty and cleaner gameplay messages

- **Cleaner screen:** the 203×25 always-visible tutorial objective banner is gone. The small `?` button below the resource HUD opens the same guide, and talking to Grooty in the camp still shows every tutorial task.
- **Top-center events:** tree chopping, gathering, crafting, level milestones and other brief messages appear in one narrow, fading status strip just below the main HUD. Messages queue rather than stacking over the player; long lines wrap within the panel.
- **Grooty name:** every displayed reference to the stationary friendly guide tree has been updated without modifying existing progress keys or resetting saves.
- **Scope:** no changes to building requirements, Ash earnings, Dog, Museum or the Long Night.

## Patch #26: First Camp tutorials and Grooty

- **Five levels per run:** First Flame, Log Storage, Tools of the Trade, A Warmer Home and the Homestead. The current objective is tracked during gameplay and can be expanded into a checklist.
- **Grooty:** a friendly talking tree with a face stays beside the camp to explain the next task. Approach the tree and press ACT, or tap the small ? button to see its advice.
- **Runs reset to Level 1:** progress in the five lessons is not permanent. Existing permanent Ash purchases and the Museum remain permanent; future Camp Legacy Ash upgrades will be designed separately.
- **Long Night:** after the final cabin, the existing one-night finale and Bank/Continue choice remain unchanged in this foundation patch. A separate optional Endless Night mode is only a locked preview for now.
- **Museum:** no title-menu entry. Build the permanent collection hut inside the camp and use ACT to visit it; existing collections are not lost.

## Permanent progression, companions and log collecting

- **Finish / continue:** After surviving the Long Night, choose **End Run & Bank Ash** or **Continue Surviving**, which retains unbanked Run Ash. Victory choice persists across checkpoint reloads. Menu > End Run requires confirmation. Existing Ash earning rates and the Long Night trigger have not been changed.
- **Ash clarity:** Run Ash is earned during the current run; Banked Ash is persistent Shop currency. Banked Ash stays safe through future runs.
- **Shop:** **Upgrades / Pets / Coming Soon** with the close button above the three tabs. Owned Good Dog remains on the original `up.dog` permanent save key and can be equipped/unequipped through Pets.
- **Dog:** follows the player, carries at most **2 actual dropped logs**, deposits them in wood storage or hands them to the player, and never creates wood from nothing. Cargo and position persist with run checkpoints.
- **BUILD / CRAFT:** Approach the completed Workbench and press ACT. Choose **ACCESS** for Tools / Supplies recipes or **BUILD PLANS** for structures. Each completed station has its own physical **UPGRADE** button.
- **Permanent Log Museum:** build it once under the Workbench **BUILD PLANS** menu for 20 Pine Logs after expanding the camp, then visit the physical Museum. The small display building appears in later runs; its collection is permanent.
- **Four original log collectibles:** Ordinary (common), Twisted (uncommon), Hand (rare) and Figure-8 (legendary). The first felled tree grants the common discovery; later unique finds use provisional odds for playtesting. They are separate from ordinary firewood and cannot be accidentally burned.
- Future run tiers, a later Long Night, and a new Ash-from-firewood formula remain **undecided**, not secretly implemented.

## Camp progression and night spectacles

- **Aurora:** a 20% chance at ordinary nightfall. Glowing sky bands render above nighttime darkness; aurora survival still earns the existing Ash bonus.
- **Shooting Star Parade:** a separate rarer sky event which spawns repeated meteor streaks through the night. Nighttime skies remain purely cosmetic except for the existing Aurora bonus.
- **Wood Axe:** crafted axe now uses a brown carved wooden wedge and bindings; Grandpa's Axe remains metallic.
- **Camp improvements:** approach the physical **Fireplace, Workbench or Log Storage** and choose **UPGRADE** from its station popup. Each supports two Pine Log-funded tiers and a second confirmation press.
- **First-tier requirement:** improve all three stations to level 1 before the final **Cabin and Hearth** stage. Level 2 upgrades are optional.
- Fireplace tiers strengthen warmth near the campfire and reduce fuel burn. Log storage tiers provide 20 and then 20 more capacity beyond the previous limit. Workbench tiers unlock the **Kindling Bundle** and **Ember Lantern** recipes; a mastered workbench reduces future craft prices by 2 wood.
- The Workbench upgrade is available through its physical station popup, **not** the crafting list. Built stations change sprite appearances as they improve.
- These are **run-scoped**, not permanent Ash upgrades. Existing saved runs use the same v1 checkpoint key; absent station levels load as zero.

## Development (Windows, macOS or Linux)

Requirements: Node.js 22+ and npm. The production build bundles the game and all runtime dependencies; it does not load Babel, React or Tailwind from a CDN.

```bash
npm ci
npm run dev        # local browser game
npm run check      # TypeScript typecheck
npm run test       # repeatable unit tests
npm run build      # production game in dist/
npm run preview    # verify production output
```

**Deployment:** Merging to `main` runs checks and builds `dist/` for GitHub Pages. The public URL and save keys stay unchanged after the migration.

## Patch #12 - visual motion and menu polish

- Woodcutting now animates the shoulder, elbow and gripping hand together; the branch/axe pivot follows the wrist through wind-up, impact and recovery without changing chop speed or damage.
- Shoreline wildlife (foxes, rabbits and low-enough birds) now participates in the existing water-reflection pass, alongside the dog and player. A very faint foreground treeline reflection adds depth without duplicating distant mountains or the full sky.
- Title actions are a compact central list. **How to Play** is its own right-side plaque (or H shortcut); bottom-left framed buttons link to [Discord](https://discord.gg/794QQWJEeP) and [YouTube](https://youtube.com/@sekafajigames). Both open only on a user's tap.
- No new gameplay progression, telemetry, fire-noise loops, or save migrations.

## Patch #18 - crafting confirmation, readable arrows, seasonal water

- **Workbench safety**: tap the same craft twice (or select twice with keyboard) before paying any wood. The first tap displays **CONFIRM? / TAP AGAIN TO CRAFT**. Switching items, navigating away or closing the menu clears the pending confirmation, and resources are rechecked at purchase. Existing crafting costs, ids and saves are unchanged.
- **Movement accessibility**: daylight and night movement arrows have a dark one-pixel outline and clear pale centres, so they're readable over bright ground and dark foliage. Existing arrow positions, hitboxes, fade timing and movement controls stay unchanged.
- **Water/reflections**: a more natural scanline reflection distortion with subtle depth fade, restrained broken travelling glints, and season-coloured shoreline wash for autumn/winter/spring/summer. Reflection sources, terrain, wildlife and physics remain untouched.
- Added automated tests for purchase confirmation, cancellation, resource loss between taps, arrow contrast and bounded water calculations. Real-phone screenshot QA remains pending.

## Patch #17 - woodland art and atmospheric depth

- Existing distant forest layers now render deterministic mixed **fir, pine, and broadleaf** silhouettes rather than near-identical triangle columns, preserving their parallax movement, color palettes and reflections.
- Winter broadleaf trees have bare branches; spring growth is compact, summer foliage is fuller, and autumn crowns have broken leaf clumps. Mountain peaks have irregular shoulders and more natural snow ledges.
- Sparse world-anchored ground vegetation changes with the seasons while leaving camp interactables unobstructed.
- Soft sunrise/sunset haze and subtle middle-distance separation improve depth. Campfire lighting has a smoother warm falloff while retaining the original night overlay and fire mechanics.
- All changes are cosmetic. World generation, day length, gameplay movement, collision, saves, audio, UI and assets are untouched. New pure rendering tests check deterministic geometry and layer bounds; phone screenshot quality still requires visual approval.

## Patch #16 - player character art polish

- Fixed side-facing shoes/toes to follow the player's actual left/right facing direction, including the crafted-boot variants. The previous leg geometry did not react to facing direction, making shoes appear backward when walking right.
- Improved alternating steps, leading/rear leg shading, shoe soles and ankle cuffs. Walking arms now reach horizontally as well as vertically, with restrained one-pixel body-weight movement.
- **Unchanged:** idle front-facing pose, articulated chopping swing and branch/axe progression, original pack-cargo sprites and 320×180 gameplay/world coordinates.
- New pixel-geometry regression tests for mirrored foot poses, toe highlights, six chops, both facings and backpacks with 0, 5, 13 and 21 logs. Actual in-browser phone screenshots still require separate visual approval.

## Menu and illustrated guide
- Title subtitle is **FOUR SEASONS. ONE FIRE.** and its central actions fit their actual rows without an empty footer.
- **Shop** replaces the Upgrades title action; Ash upgrades remain functional and use the same saved upgrade IDs/costs. A second, nontransactional **Coming Soon** tab is inactive except for navigation; no payment features or offers.
- **How to Play** is a seven-page visual walkthrough using the game's actual world sprites: movement, fire, wood gathering, workbench construction, crafting, camp expansion and permanent Ash upgrades. Buttons and keyboard arrows/A-D/E step through it; gameplay is not altered.
- A new seven-day seasonal calendar now progresses **autumn → winter → spring → summer** (repeat), changing tree details and three wildlife species per season. Current weather probabilities and survival difficulty deliberately remain unchanged.
- Movement edge highlights fade in/out and soften toward the centre; the river has small back-and-forth shoreline waves with sparse low-opacity foam. See [season design](docs/SEASONS.md).

## Gameplay

- Hold the left/right side of the screen or press A/D to walk. Movement immediately interrupts an unfinished chop (and does not damage the tree). To chop again, release and repress ACT.
- Press ACT or E to chop trees, feed the fire and interact. Hold ACT for repeated chopping while stationary.
- Base capacity is 5 logs; a permanent and a crafted backpack each add 8 capacity, up to 21. The bag has three visual sizes with one small sprite per carried log.
- Start with a branch for chopping; craft the **Wood Axe** (existing save-compatible maul craft ID) at the workbench, or earn the permanent Grandpa's Axe upgrade.
- The first camp stage is now **Wood Ring** (8 wood), a visible timber windbreak with the original wind-protection effect; tree sprites have detailed layered silhouettes and winter-only snow caps.
- The player turns toward the camera when idle, with a two-eye face, and retains visible facial detail when moving left.
- Fullscreen is responsive, with CSS immersive fallback on browsers lacking the fullscreen API and safe-area-aware canvas fitting.
- Gather 15 logs for each initial workbench/pile site, then craft boots, pack and other gear at the bench. Build a camp, survive seasonal days and the Long Night, and earn ash for permanent upgrades.
- Menus include settings, credits, a privacy policy, audio mixer, High/Low visual effects, and a two-step save reset.
- An unfinished run can be continued from the title menu after reopening the browser. Completed runs bank earned ash and clear the checkpoint. Win/death/retirement results now offer **Main Menu** without banking rewards again.

## Professional foundation - modularization phase 2

- `src/App.tsx`: browser/React lifecycle, input and drawing loop
- `src/game/config.ts`: immutable world and crafting configuration
- `src/game/rules.ts`: extracted pure gameplay formulas with unit tests
- `src/game/math.ts`: pure math utilities with unit tests
- `src/game/audio.ts`: procedural action sound, wind ambience and saved mixer preferences
- `src/game/graphics.ts`: standalone visual-effects preference
- `src/game/weather.ts`: pure weather blending function and unit tests
- `src/game/save.ts`: permanent-progress and active-run persistence, validated separately
- `src/game/palette.ts`: season selection and blended palettes
- `src/game/font.ts`: standalone pixel-font drawing and text measurement
- `src/game/renderUtils.ts`: shared color, pixel and random helpers
- `src/game/renderSprites.ts`: all 18 standalone player/tree/camp/world sprite renderers
- `src/game/game.ts`: **preserved world simulation, remaining scene rendering, and in-canvas UI** - still being separated in small, tested patches
- `src/game/input.ts`: isolated keyboard, pointer and multi-touch adapter
- `src/ui/viewport.ts`: tested aspect-preserving fullscreen dimensions and safe-area fitting
- `src/main.tsx` and `src/styles.css`: application bootstrap and built styles
- `public/privacy.html`: published data-handling policy
- `docs/ARCHITECTURE.md`: engineering rules and staged extraction plan
- `docs/MOBILE.md`: Android-first / iOS-later packaging readiness
- `docs/BACKLOG.md`: all approved but unfinished user requests (including player idle, wooden axe, wooden ring, better trees and mobile fullscreen)

### Important limits
This is the **foundation restructuring milestone**, not a completed production game or mobile app. Rendering, player art and mobile viewport still need further work. Source restructuring is deliberately behaviour-preserving; the outstanding improvements are tracked in [the backlog](docs/BACKLOG.md), not incorrectly marked done.

Existing progress keys (`sekampfire-meta-v1` and `sekampfire-run-v1`) are preserved. `base: './'` in Vite keeps output asset paths relative for GitHub Pages and future native packaging. `android/` and `ios/` projects have **not** been created; they will be added only when native builds are requested.

See [architecture](docs/ARCHITECTURE.md), [mobile plan](docs/MOBILE.md), [backlog](docs/BACKLOG.md), and [privacy policy](public/privacy.html).
