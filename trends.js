// Bundled trend packs. The app picks the pack that matches today's date,
// and you can switch packs with the chips at the top of the Trends tab.
// To refresh trends, edit this file (or add a new pack) and push it to GitHub.
window.LL_TRENDS = [
  {
    id: "holiday", season: "Holiday", months: [11, 12], updated: "2026-11-24",
    intro: "Glossy, short and grown-up: deep reds, frosty or milky neutrals, and one small festive detail instead of full Christmas scenes. Short to medium squoval or round shapes.",
    trends: [
      { look: "Glassy candy-apple red", what: "Bright red in a jelly or high-gloss creme. The classic holiday hand.", colors: ["#c1121f", "#e0203a"], polishes: [{ brand: "OPI", name: "Big Apple Red", hex: "#c1121f" }, { brand: "Essie", name: "Really Red", hex: "#c4141c" }], tags: "#rednails #cherrynails #christmasnails", hooks: ["dipped in candy apple, no notes", "red nails are a personality and i'm keeping it", "santa's favourite shade, apparently", "glossy enough to see my reflection in"] },
      { look: "Black cherry", what: "Deep burgundy, near-black wine, super glossy.", colors: ["#3b0a17", "#5c0f24"], polishes: [{ brand: "OPI", name: "Black Cherry Chutney", hex: "#3b0a17" }, { brand: "Nailberry", name: "Noirberry", hex: "#2e0a14" }], tags: "#burgundynails #winternails #darknails", hooks: ["black cherry season is the best season", "these look like a glass of red at a holiday party", "dark, glossy, unbothered"] },
      { look: "Frosted finish", what: "Iridescent white, icy pink or champagne with a cool shimmer.", colors: ["#eef1f5", "#f3d9e3", "#e8d6b8"], polishes: [{ brand: "OPI", name: "Kyoto Pearl", hex: "#f1ebe2" }], tags: "#frostednails #winternails #chromenails", hooks: ["first snow, but make it nails", "frosted like a december morning", "ice queen hours"] },
      { look: "Milky winter white", what: "Sheer or creamy whites, pearly, on short nails.", colors: ["#f4efe9", "#fbf7f2"], polishes: [{ brand: "Essie", name: "Marshmallow", hex: "#f4efe9" }, { brand: "Essie", name: "Blanc", hex: "#fbfbf8" }, { brand: "Rimmel", name: "White Hot Love", hex: "#f8f6f3" }], tags: "#milkynails #cleangirlnails #minimalistnails", hooks: ["milk bath for my nails", "quiet luxury, loud shine", "less is more (except shine, more shine)"] },
      { look: "Champagne sparkle", what: "Pale gold glitter, often as a French tip or cat eye. The New Year's Eve pick.", colors: ["#d9c08a", "#efe2bf"], polishes: [{ brand: "Essie", name: "Good as Gold", hex: "#c9a65a" }], tags: "#nyenails #glitternails #goldnails", hooks: ["popping bottles, popping tips", "dressed for midnight", "champagne problems, champagne nails"] },
      { look: "Chocolate and cocoa", what: "Taupe, coffee and creamy brown on short round nails.", colors: ["#5a3a2a", "#8a6650", "#b59a85"], polishes: [{ brand: "OPI", name: "Linger Over Coffee", hex: "#7a4b3a" }, { brand: "OPI", name: "You Don't Know Jacques!", hex: "#6b5a4e" }], tags: "#brownnails #chocolatenails #winternails", hooks: ["hot cocoa, but on my hands", "brown nails stay winning", "mocha mood for the cold months"] },
      { look: "Fine French tips", what: "Micro-thin tips in silver, gold, chrome or a colour.", colors: ["#f2dcd6", "#c0c0c8", "#c9a65a"], polishes: [], tags: "#frenchnails #microfrench #naildesign", hooks: ["the french tip got a holiday upgrade", "tiny tips, big energy"] },
      { look: "Velvet cat eye", what: "Magnetic shimmer that moves on camera, in wine, silver or champagne.", colors: ["#4a1424", "#9aa0ab", "#d9c08a"], polishes: [], tags: "#cateyenails #velvetnails #nailreels", hooks: ["watch them move (sound on, light on)", "these catch the light like tinsel", "can't stop tilting my hands"] },
      { look: "One festive detail", what: "Clean base plus a single bow, holly sprig, star or ribbon stripe.", colors: ["#f3d3cf", "#c1121f", "#1f4d36"], polishes: [], tags: "#bownails #christmasnails #holidaynails", hooks: ["wrapped with a bow", "just a little bit of christmas", "festive, but make it subtle"] },
      { look: "Evergreen accents", what: "Pine or bottle green, alone or with gold.", colors: ["#1f4d36", "#2f6b4a", "#c9a65a"], polishes: [], tags: "#greennails #christmasnails #winternails", hooks: ["forest green and feeling festive", "evergreen in every sense"] }
    ]
  },
  {
    id: "winter", season: "Late winter & Valentine's", months: [1, 2], updated: "2026-11-24",
    intro: "After the sparkle of the holidays: cosy neutrals, icy blues, and soft pinks and reds building up to Valentine's Day.",
    trends: [
      { look: "Soft pink sheers", what: "Barely-there pink jelly or sheer, like a your-nails-but-better finish.", colors: ["#f6d6d9", "#f3d3cf"], polishes: [{ brand: "Essie", name: "Ballet Slippers", hex: "#f6d6d9" }, { brand: "OPI", name: "Bubble Bath", hex: "#f3d3cf" }], tags: "#pinknails #sheernails #cleangirlnails", hooks: ["my nails but better", "ballet core never left", "soft launch: these nails"] },
      { look: "Tiny hearts", what: "Nude base with one or two small red or pink hearts.", colors: ["#f2cfc8", "#c1121f", "#e9a3b7"], polishes: [{ brand: "Essie", name: "Mademoiselle", hex: "#f2cfc8" }], tags: "#valentinesnails #heartnails #nailart", hooks: ["wearing my heart on my nails", "be mine (the nails, i mean)", "love language: fresh manicure"] },
      { look: "Icy blue", what: "Pale frosted blue or periwinkle, often with chrome.", colors: ["#b7c3cf", "#c9d8ea"], polishes: [{ brand: "OPI", name: "Less is Norse", hex: "#b7c3cf" }], tags: "#bluenails #winternails #chromenails", hooks: ["cold outside, cooler nails", "frozen but make it fashion", "january blues, the good kind"] },
      { look: "Lipstick red", what: "A true blue-toned red creme. Date-night classic.", colors: ["#b2163a", "#a0161f"], polishes: [{ brand: "Revlon", name: "Cherries in the Snow", hex: "#b2163a" }, { brand: "Chanel", name: "Pirate", hex: "#a0161f" }], tags: "#rednails #valentinesnails #classicnails", hooks: ["red, because obviously", "dinner reservation energy", "a little bit dramatic"] },
      { look: "Cosy greige", what: "Warm grey-beige cremes that go with every knit.", colors: ["#a89b93", "#cdb9a7"], polishes: [{ brand: "Essie", name: "Chinchilly", hex: "#a89b93" }, { brand: "Essie", name: "Sand Tropez", hex: "#cdb9a7" }], tags: "#neutralnails #greigenails #minimalnails", hooks: ["matches every sweater i own", "neutral, never boring", "sweater weather manicure"] },
      { look: "Navy and silver", what: "Deep navy with a silver accent nail or chrome tip.", colors: ["#1f2340", "#c0c0c8"], polishes: [{ brand: "OPI", name: "Russian Navy", hex: "#1f2340" }], tags: "#navynails #winternails #nailinspo", hooks: ["midnight blue mood", "navy is the new black"] }
    ]
  },
  {
    id: "spring", season: "Spring", months: [3, 4, 5], updated: "2026-11-24",
    intro: "Pastels, florals and glazed finishes. Short and almond shapes with lots of shine.",
    trends: [
      { look: "Butter yellow", what: "Soft creamy yellow, the colour of the season.", colors: ["#f6e7a6", "#f3df8c"], polishes: [], tags: "#yellownails #springnails #pastelnails", hooks: ["spreading like butter", "sunshine on my fingertips", "soft yellow era"] },
      { look: "Mint and pistachio", what: "Fresh pastel greens, solo or as a French tip.", colors: ["#b6e4cf", "#cfe5c0"], polishes: [{ brand: "Essie", name: "Mint Candy Apple", hex: "#b6e4cf" }], tags: "#mintnails #greennails #springnails", hooks: ["mint condition", "pistachio gelato but make it nails", "fresh out of the box"] },
      { look: "Lilac", what: "Cool lavender cremes and jellies.", colors: ["#c9b1d9", "#d8c6e6"], polishes: [{ brand: "OPI", name: "Do You Lilac It?", hex: "#c9b1d9" }], tags: "#lilacnails #lavendernails #pastelnails", hooks: ["lilac it a lot", "lavender haze", "purple but soft about it"] },
      { look: "Tiny florals", what: "Sheer base with small hand-painted flowers or daisies.", colors: ["#f6d6d9", "#ffffff", "#f6e7a6"], polishes: [{ brand: "Essie", name: "Ballet Slippers", hex: "#f6d6d9" }], tags: "#floralnails #daisynails #springnails", hooks: ["flower season, finally", "growing a little garden on my hands", "she's in her daisy era"] },
      { look: "Glazed donut", what: "Milky base with a pearly chrome powder on top.", colors: ["#f4efe9", "#efe6ef"], polishes: [{ brand: "OPI", name: "Funny Bunny", hex: "#f4efe8" }], tags: "#glazednails #chromenails #nailinspo", hooks: ["glazed and confused", "fresh from the bakery", "pearl finish, always"] },
      { look: "Bubblegum pink", what: "Bright sweet pink cremes.", colors: ["#f6cbd1", "#e9a3b7"], polishes: [{ brand: "Essie", name: "Fiji", hex: "#f6cbd1" }, { brand: "Sally Hansen", name: "Pinky Promise", hex: "#e9a3b7" }], tags: "#pinknails #springnails #cutenails", hooks: ["pink is a neutral, fight me", "pinky promise these are cute", "bubblegum but chic"] }
    ]
  },
  {
    id: "summer", season: "Summer", months: [6, 7, 8], updated: "2026-11-24",
    intro: "Bright, juicy colours, neons and beachy chrome. Toes count too.",
    trends: [
      { look: "Coral and watermelon", what: "Juicy reddish pinks and corals.", colors: ["#e2484f", "#f06e62"], polishes: [{ brand: "Essie", name: "Watermelon", hex: "#e2484f" }, { brand: "OPI", name: "Strawberry Margarita", hex: "#e0435a" }], tags: "#coralnails #summernails #brightnails", hooks: ["one slice of summer, please", "juicy and i know it", "fruit salad on my fingers"] },
      { look: "Tomato girl red", what: "Warm orange-reds that look great with a tan.", colors: ["#d2463f", "#c1121f"], polishes: [{ brand: "OPI", name: "Cajun Shrimp", hex: "#d2463f" }], tags: "#tomatogirl #rednails #summernails", hooks: ["tomato girl summer", "spritz in one hand, red nails on the other", "vacation mode: on"] },
      { look: "Neon pop", what: "Highlighter pink, orange or lime, often as tips.", colors: ["#ff3fa4", "#ff7a1a", "#b7f03c"], polishes: [], tags: "#neonnails #summernails #brightnails", hooks: ["visible from space", "loud nails, no apologies", "neon so they can see me coming"] },
      { look: "Ocean blues", what: "Bright cobalt, turquoise and aqua.", colors: ["#1f4fa6", "#2bb3c0"], polishes: [{ brand: "Essie", name: "Butler Please", hex: "#1f4fa6" }], tags: "#bluenails #beachnails #summernails", hooks: ["ocean on my hands", "salt water state of mind", "blue like the pool"] },
      { look: "Holo and chrome", what: "Rainbow holo or silver chrome that flashes in the sun.", colors: ["#e9e4f2", "#c0c0c8"], polishes: [{ brand: "Holo Taco", name: "Unicorn Skin", hex: "#e9e4f2" }], tags: "#holonails #chromenails #nailreels", hooks: ["take me into the sun", "rainbows in every photo", "holo, is it me you're looking for"] },
      { look: "Clean white", what: "Crisp opaque white, great with a tan.", colors: ["#f7f7f5", "#fafafa"], polishes: [{ brand: "OPI", name: "Alpine Snow", hex: "#f7f7f5" }, { brand: "Holo Taco", name: "One Coat White", hex: "#fafafa" }], tags: "#whitenails #summernails #minimalnails", hooks: ["fresh white for fresh starts", "clean, crisp, done", "white nails + golden hour"] }
    ]
  },
  {
    id: "fall", season: "Fall", months: [9, 10], updated: "2026-11-24",
    intro: "Warm, rich and moody: browns, olives, burgundies and a little Halloween fun.",
    trends: [
      { look: "Espresso brown", what: "Deep chocolate and coffee cremes.", colors: ["#4a2e22", "#7a4b3a"], polishes: [{ brand: "OPI", name: "Linger Over Coffee", hex: "#7a4b3a" }], tags: "#brownnails #fallnails #autumnnails", hooks: ["espresso shot, but make it nails", "brown season is here", "fall in a bottle"] },
      { look: "Olive and moss", what: "Muted greens, from khaki to deep moss.", colors: ["#5d6b3a", "#3f4a2a"], polishes: [], tags: "#olivenails #greennails #fallnails", hooks: ["olive you so much", "forest walk in nail form", "earth tones only"] },
      { look: "Wine and burgundy", what: "Classic deep reds with a hint of berry.", colors: ["#5a0f20", "#6b1426"], polishes: [{ brand: "Essie", name: "Bordeaux", hex: "#5a0f20" }, { brand: "OPI", name: "Malaga Wine", hex: "#6b1426" }], tags: "#burgundynails #wine #fallnails", hooks: ["pour me another coat", "wine o'clock on my nails", "deep red, deeper thoughts"] },
      { look: "Pumpkin spice", what: "Burnt orange and rust, sometimes with gold.", colors: ["#c25a1f", "#a1441c"], polishes: [], tags: "#orangenails #pumpkinnails #fallnails", hooks: ["pumpkin spice and everything nice", "leaves are falling, nails are calling", "basic and proud of it"] },
      { look: "Spooky but chic", what: "Black, a tiny ghost or web, or a black French.", colors: ["#111111", "#ffffff"], polishes: [{ brand: "OPI", name: "Black Onyx", hex: "#111111" }, { brand: "Holo Taco", name: "One Coat Black", hex: "#141414" }], tags: "#halloweennails #blacknails #spookynails", hooks: ["boo, i like your nails", "spooky season, cute nails", "a little bit witchy"] },
      { look: "Plum and aubergine", what: "Dark purples, close to black.", colors: ["#2a1a2e", "#4a2a4a"], polishes: [{ brand: "OPI", name: "Lincoln Park After Dark", hex: "#2a1a2e" }], tags: "#plumnails #darknails #fallnails", hooks: ["dark plum, darker mood", "aubergine is a vibe", "vampy and loving it"] }
    ]
  }
];

window.LL_TIPS = [
  "Put the hook first. Instagram cuts captions off after two lines, so the fun line goes up top and the polish list below.",
  "Post photos at 4:5 (1080 x 1350) so the nails fill the feed.",
  "Film a few seconds of tilting your hand under a lamp for cat eye, chrome and glitter. Reels sell shimmer.",
  "Carousel it: the full set, then close-ups, then the bottles lined up. Bottle shots make brand reposts more likely.",
  "Tag brands twice: @mention them in the caption and tag them on the photo itself.",
  "End with a question (\"red or wine for this week?\") to get comments.",
  "Use 3 to 5 relevant hashtags rather than a block of 30."
];
