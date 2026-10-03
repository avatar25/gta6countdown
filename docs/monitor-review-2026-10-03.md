# Monitor review — 3 October 2026

Reviewed snapshot: `ff36d5ca24758a52df65a5e3da5ac607beece49f` (51 candidates).

Applied **4 approvals, 40 rejections, 7 holds** through the manual gate.
No release, preload or storefront unlock target was changed. Rejections record
both the observed content hash and an editorial category, preserving review of
later changes under the same ID. Same-day and promotional corroborations were
removed from the approved and retained candidates.

## Approved milestones

- Full Extended Look upload: `tJbzMqJGH4k`; [Rockstar's page](https://www.rockstargames.com/VI/an-extended-look) directly links the exact video. Preserve August 28 01:00 UTC upload time (August 27 US date).
- Collector's box: [Rockstar Store](https://store.rockstargames.com/merchandise/gtavi-goodtime-state-vice-city-collection); US$399.99, game sold separately. Announcement dated September 24 on the official GTA VI site.
- Album announcement: [Rockstar music page](https://www.rockstargames.com/VI/music); 34 tracks, November 19, vinyl/CD preorder formats. Announcement dated September 17 on the official GTA VI site.
- Controller reveal: [PlayStation Blog](https://blog.playstation.com/2026/09/03/first-look-at-the-grand-theft-auto-vi-limited-edition-dualsense-wireless-controllers/); two designs, November 19 launch, September 10 preorders, regional qualifications.

Press-origin records retain their original ingestion source ID/type. Their
public links and labels point to the verified first-party evidence. The original
RSS wrappers and observations remain in the reviewed commit's history.

## Retained investigations

- **GTA 6 PEGI Age Rating Reveals Mentions of 'Decapitation' and Cocaine That Can Be 'Snorted' at 'Any Time'** (`5d79ebcd8b1b4652`): Retrieve the exact PEGI record for GTA VI, including publisher, platforms and rating text. Confirm publication/first-observation time; publish one restrained classification milestone only if verified.
- **GTA 6 Gets Official ESRB Rating and It's as Mature as You'd Expect** (`ee81340171b8559a`): Resolve canonical article identity, inspect the rating badge and game-specific ESRB record, and retain one candidate. Do not interpret an age rating as certification, gone gold, or a guaranteed launch date.
- **Rockstar Confirms GTA 6 Simulates Tropical Storms and Hurricanes** (`d6c82f96363162b4`): Locate the Rockstar statement or authenticated preview segment. If directly confirmed and editorially useful, add one gameplay milestone; otherwise reject the headline-only claim.
- **Xbox Says Its Share of GTA 6 Preorders Matches Its Share of the Console Market, Following PS5 Dominance Claim** (`a118a1ad689570ba`): Retrieve the original Xbox statement and the estimate it answers. Update the existing preorder-estimates event if it adds a material correction; avoid a second sales-discourse card and remove #8 as corroboration.
- **Official site now states: August 27, 2026, December 4, 2023, May 6, 2025, November 19, 2026, September 17, 2026, September 24, 2026** (`689aec26a9a6da52`): Do not publish the date list. Extract releaseDate separately from article dates and preserve context. Archive/baseline this hash after a contextual parser change; keep the stable watcher eligible for future changes.
- **GTA 6: With 30FPS Seemingly Confirmed, Is 60FPS Actually Realistic?** (`441bd2e320300b34`): Read the analysis and locate any explicit Rockstar/Sony performance-mode specification. Separate measured preview frame rate from final gameplay modes. Publish a factual mode claim only with direct evidence.
- **GTA 6 life simulation elements confirmed: thank god, we can turn the offensively hot Jason and Lucia into exhausted slobs like the rest of us** (`1a7a7c69ffecb53a`): Locate the original article and its underlying evidence/publication revisions. Verify whether it relies on authenticated footage, a statement or alleged leaked material. Do not publish as official on the strength of “confirmed” in the headline.

Ratings and final frame-rate modes are not verified by this commit. The life-simulation
article's recorded publication precedes the stored Netflix premiere, so its
underlying source needs inspection. The official-site date list mixes trailer,
launch and Newswire dates and must not change the release target.

## Decision inventory

Numbers refer to the pinned review snapshot; hashes identify observed versions.
Full IDs, reasons and categories are recorded in data/events.json or
data/pending.json. Rejected means redundant, stale or out of scope for a timeline
entry, not a claim adjudicated false.

| # | Content hash | Decision | Candidate |
|---|---|---|---|
| 1 | `5d79ebcd8b1b4652` | Investigate | GTA 6 PEGI Age Rating Reveals Mentions of 'Decapitation' and Cocaine That Can Be 'Snorted' at 'Any Time' |
| 2 | `f19cbde60994c35b` | Reject | Kingdom Come: Deliverance studio co-founder hopes Grand Theft Auto 6 will 'blaze a trail' to higher game prices |
| 3 | `ee81340171b8559a` | Investigate | GTA 6 Gets Official ESRB Rating and It's as Mature as You'd Expect |
| 4 | `16f83e7686c76c65` | Reject | GTA 6 Gets Official ESRB Rating and It's as Mature as You'd Expect |
| 5 | `d6c82f96363162b4` | Investigate | Rockstar Confirms GTA 6 Simulates Tropical Storms and Hurricanes |
| 6 | `582692d96091d693` | Reject | GTA 6 Pre-Orders 'Heavily Skewed' Towards PS5, Xbox Exec Responds |
| 7 | `a118a1ad689570ba` | Investigate | Xbox Says Its Share of GTA 6 Preorders Matches Its Share of the Console Market, Following PS5 Dominance Claim |
| 8 | `6e00aaeaae695a7c` | Accept | GTA 6 $400 Collector’s Edition Comes With Everything Except The Game |
| 9 | `689aec26a9a6da52` | Investigate | Official site now states: August 27, 2026, December 4, 2023, May 6, 2025, November 19, 2026, September 17, 2026, September 24, 2026 |
| 10 | `90bb2eebde8c49e3` | Reject | GTA 6 Boss Seems A Bit Grumpy And Defensive While Answering An Investor's Question About Frequent Delays |
| 11 | `c0cd62259756aad8` | Reject | Save $10 Off Your Grand Theft Auto VI Limited Edition PS5 DualSense Controller Preorder |
| 12 | `1fa9533404cef280` | Accept | GTA 6 Soundtrack Gets Physical CD and Vinyl Release, Rockstar Confirms |
| 13 | `2e6682fbcba79965` | Reject | Grand Theft Auto VI: The Album Is Up for Preorder, Featuring 34 Tracks on Limited-Edition Vinyl, Standard Vinyl, or CD |
| 14 | `87615ea25f2b8fee` | Reject | GTA 6 Soundtrack – All Confirmed Songs So Far |
| 15 | `76e9048f4a39bad0` | Reject | Grand Theft Auto 6 Ultimate Edition Is $11 Off on PS5 if You Use This Trick (Today Only) |
| 16 | `d945e1cca0e33b04` | Reject | GTA 6′ s First Voice Actor Is Confirmed, And There’s A Good Chance You Already Figured It Out |
| 17 | `23fff24b5e36871d` | Reject | Will GTA 6's Ultimate Edition Be Worth The Extra Cost? Here's What It'll Come With |
| 18 | `3abfa65576dfeded` | Reject | 'You're Gonna See Me in It' — King of the Hill Voice Actor Confirms Role in GTA 6, First Major Cast Member to Do So |
| 19 | `8ff47b639a0e334f` | Reject | First GTA 6 Actor Officially Confirmed, And It’s A Big Name |
| 20 | `6cff5abd6798e556` | Reject | GTA 6's Limited Edition PS5 Controller Preorders Overload PlayStation's Store, and Scalpers Are Already Reselling Them on eBay |
| 21 | `995435210c7a454b` | Reject | GTA 6 PS5 Controller Preorders Are Live, But Stock Is Limited |
| 22 | `27b775af026bcfdf` | Reject | GTA 6's PS5 Controller Preorders Create Chaos on PlayStation Store as Scalpers Take Advantage of Scarcity |
| 23 | `13ddd254fe77faa5` | Reject | GTA 6 PS5 Controller Pre-Orders Go Live On PlayStation Store And It Immediately Collapses, Meanwhile eBay Is Flooded With Scalpers |
| 24 | `8022bf59c8faeed4` | Reject | GTA 6 DualSense Controller Preorders Are Now Live in the UK |
| 25 | `1e9b0cf8d931b7ce` | Reject | Where to Pre-Order GTA 6 Controllers for PS5 |
| 26 | `d37dae23cdf552fc` | Reject | GTA 6 Was Not "Fully Formed" When Trailer 1 Came Out In 2023 |
| 27 | `057ca9416e410346` | Reject | Best Buy Is Offering $100 Gift Cards For $60 This Weekend, And That's Great If You Want GTA 6's Premium Edition |
| 28 | `f3482a31d60de080` | Reject | Grand Theft Auto 6 Is Getting a Pair of Limited Edition PS5 Controllers |
| 29 | `44c3209056732405` | Reject | Grand Theft Auto 6 Is Getting a Pair of Limited Edition PS5 Controllers |
| 30 | `46519184dd9ef23d` | Reject | Grand Theft Auto 6 Preorder Discount: Here's How to Save $12 for the PS5 Game – But the Deal Ends Soon |
| 31 | `656f15c57ae7733c` | Reject | GTA 6 Limited-Edition DualSense Controllers Are On The Way, And They Look Fantastic |
| 32 | `58e985fdb4cce4e7` | Reject | Everything Announced at the Sony State of Play - September 2026 |
| 33 | `af8523d407d94073` | Reject | PlayStation reveals limited-edition GTA VI controllers. |
| 34 | `517e42f873366cfb` | Accept | GTA 6 Limited Edition PS5 Controllers Revealed, Out 19th November |
| 35 | `c02a0ad0d02f3848` | Reject | No Rest for the Wicked, which was slated to hit 1.0 a month before Grand Theft Auto 6, is delayed into 2027 |
| 36 | `51db0a8ec6329868` | Reject | GTA 6 Netflix Trailer: Every Song We Heard, Including Deep Cuts |
| 37 | `441bd2e320300b34` | Investigate | GTA 6: With 30FPS Seemingly Confirmed, Is 60FPS Actually Realistic? |
| 38 | `2261bb9d6e763325` | Reject | What Console Should You Buy for GTA 6? We Break Down PS5 vs. Xbox Pricing, Deals, and More |
| 39 | `4e07bf70602dbd43` | Reject | Netflix listing schedule reads 2026-08-27T19:00:00.000Z |
| 40 | `3dc0f8e5bbb4969a` | Reject | Rockstar published a new video: Grand Theft Auto VI: An Extended Look — Now Playing |
| 41 | `e8213b09c0b8f2b7` | Reject | Rockstar published a new video: Grand Theft Auto VI: An Extended Look — Now Playing |
| 42 | `2643957d351d31ef` | Reject | Rockstar published a new video: Grand Theft Auto VI: An Extended Look — Now Playing |
| 43 | `723d5be38dbe31b9` | Reject | Rockstar published a new video: Grand Theft Auto VI: An Extended Look — Now Playing |
| 44 | `35d1a9ef69638aa0` | Reject | Rockstar published a new video: Grand Theft Auto VI: An Extended Look — Now Playing |
| 45 | `4744834bd85066e7` | Reject | Rockstar published a new video: Grand Theft Auto VI: An Extended Look — Now Playing |
| 46 | `853d68f55f42c1a9` | Accept | Rockstar published a new video: Grand Theft Auto VI: An Extended Look |
| 47 | `f63d6d1286f59e4d` | Reject | Netflix listing copy changed |
| 48 | `1a7a7c69ffecb53a` | Investigate | GTA 6 life simulation elements confirmed: thank god, we can turn the offensively hot Jason and Lucia into exhausted slobs like the rest of us |
| 49 | `20de6c9b623e90e6` | Reject | Why Take-Two Won’t Share ‘Unprecedented’ ‘Grand Theft Auto VI’ Pre-Order Numbers |
| 50 | `771f353af80a21fa` | Reject | Grand Theft Auto 6: An Extended Look Global Release Times Confirmed |
| 51 | `89764a079f2fd8ff` | Reject | GTA 6 Gameplay Leaked Ahead Of Its New Trailer, And Rockstar Is Taking Down The Videos |

## Remaining monitor work

- Canonicalize Google News URLs and cluster duplicate press headlines.
- Extract launch dates separately from trailer and Newswire dates.
- Narrow the press filter to exclude deals, shopping guides, casting and unrelated game delays.
- Review automatic official provenance on mixed leak/takedown coverage.
- Investigate YouTube feed health: the reviewed snapshot recorded HTTP 500 and 23 errors in 163 polls.

The gate now accepts only explicitly reviewed published-event IDs for
corroboration. It rejects versions rather than permanently disabling new values.
Promotional Shorts with a “Now Playing” suffix collapse into their full upload.
Editorial rejection categories remain visible in approval rate without being
miscounted as source inaccuracies.

