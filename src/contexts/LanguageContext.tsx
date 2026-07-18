import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "mr";

type Dict = Record<string, { en: string; mr: string }>;

// Master translation dictionary. English first (primary), Marathi second.
export const dict = {
  // Header / nav
  "nav.home": { en: "Home", mr: "मुख्यपृष्ठ" },
  "nav.products": { en: "Products", mr: "उत्पादने" },
  "nav.hampers": { en: "Hampers", mr: "हॅम्पर" },
  "nav.how": { en: "How to order", mr: "ऑर्डर कशी" },
  "nav.contact": { en: "Contact", mr: "संपर्क" },
  "nav.account": { en: "My account", mr: "माझे खाते" },
  "nav.login": { en: "Login", mr: "लॉगिन" },
  "nav.cart": { en: "Cart", mr: "कार्ट" },
  "brand.tagline": { en: "Where purity meets glow", mr: "शुद्धता तिथे तेज" },

  // Hero
  "hero.badge": { en: "Where purity meets glow", mr: "शुद्धता तिथे तेज" },
  "hero.title.1": { en: "Natural", mr: "नैसर्गिक" },
  "hero.title.beauty": { en: "beauty", mr: "सौंदर्य" },
  "hero.title.from": { en: "from", mr: "" },
  "hero.title.tradition": { en: "tradition", mr: "परंपरेतून" },
  "hero.subtitle": {
    en: "Ubtan, bath salts, soaps, face masks, face oil and gift hampers — pure handcrafted skincare from turmeric, sandalwood and herbs.",
    mr: "उटणे, बाथ सॉल्ट, साबण, फेस मास्क, फेस ऑईल आणि गिफ्ट हॅम्पर — हळद, चंदन आणि औषधी वनस्पतींपासून हाताने बनवलेली शुद्ध स्किनकेअर.",
  },
  "hero.cta.shop": { en: "Shop now", mr: "आता खरेदी करा" },
  "hero.cta.hampers": { en: "View hampers", mr: "हॅम्पर ऑफर पहा" },
  "hero.tag.herbal": { en: "100% herbal", mr: "१००% हर्बल" },
  "hero.tag.handmade": { en: "Handcrafted", mr: "हस्तनिर्मित" },
  "hero.tag.cruelty": { en: "Cruelty-free", mr: "क्रूरतामुक्त" },
  "hero.card.title": { en: "Real ubtan, real glow", mr: "खरा उटणे, खरी चमक" },
  "hero.card.sub": { en: "Limited stock", mr: "मर्यादित स्टॉक" },

  // Features
  "feat.wa.title": { en: "WhatsApp orders", mr: "व्हॉट्सअ‍ॅप ऑर्डर" },
  "feat.wa.desc": {
    en: "Send a ready-made order from your cart instantly",
    mr: "कार्टमधून थेट ऑर्डर मेसेज तयार होतो",
  },
  "feat.secure.title": { en: "Direct contact", mr: "सुरक्षित संपर्क" },
  "feat.secure.desc": {
    en: "Reach us on phone, email and Instagram",
    mr: "फोन, ईमेल आणि इंस्टाग्रामवर थेट संपर्क",
  },
  "feat.gift.title": { en: "Perfect for gifting", mr: "गिफ्टसाठी योग्य" },
  "feat.gift.desc": {
    en: "Ideal for bulk and custom hampers",
    mr: "बल्क आणि कस्टम हॅम्परसाठी आदर्श",
  },
  "feat.herbal.title": { en: "100% herbal", mr: "१००% हर्बल" },
  "feat.herbal.desc": {
    en: "Paraben & chemical-free, gentle on every skin",
    mr: "पॅराबेन व केमिकलमुक्त, सर्व त्वचेसाठी",
  },

  // Products
  "products.eyebrow": { en: "House Of Kanti store", mr: "हाऊस ऑफ कांती स्टोअर" },
  "products.title.1": { en: "Curated", mr: "तुमच्यासाठी निवडक" },
  "products.title.2": { en: "essentials for you", mr: "उत्पादने" },
  "products.subtitle": {
    en: "100% herbal, handcrafted and safe for every skin — House Of Kanti's lovingly made essentials.",
    mr: "१००% हर्बल, हस्तनिर्मित आणि सर्व त्वचेसाठी सुरक्षित — हाऊस ऑफ कांतीची काळजीपूर्वक तयार केलेली उत्पादने.",
  },
  "products.discount": { en: "OFF", mr: "सूट" },
  "products.add": { en: "Add to cart", mr: "कार्टमध्ये टाका" },
  "products.tag.natural": { en: "Natural", mr: "नैसर्गिक" },
  "products.tag.vegan": { en: "Vegan", mr: "व्हीगन" },
  "products.tag.cruelty": { en: "Cruelty-free", mr: "क्रूरतामुक्त" },
  "products.tag.handmade": { en: "Handmade", mr: "हस्तनिर्मित" },
  "products.toast.added": { en: "Added to cart", mr: "कार्टमध्ये जोडले" },
  "products.toast.wishadd": { en: "Added to wishlist", mr: "विशलिस्टमध्ये जोडले" },
  "products.toast.wishrm": { en: "Removed from wishlist", mr: "विशलिस्टमधून काढले" },
  "products.toast.loginfav": {
    en: "Login to save favourites",
    mr: "आवडती उत्पादने जतन करण्यासाठी लॉगिन करा",
  },

  // Why House Of Kanti
  "why.eyebrow": { en: "Why House Of Kanti?", mr: "हाऊस ऑफ कांती का?" },
  "why.title.1": { en: "Six reasons of", mr: "शुद्धतेची" },
  "why.title.2": { en: "purity", mr: "सहा कारणे" },
  "why.subtitle": {
    en: "Not just a skincare brand — a modern voice of Ayurveda.",
    mr: "फक्त एक स्किनकेअर ब्रँड नव्हे — आयुर्वेदाची आधुनिक अभिव्यक्ती.",
  },
  "why.r1.t": { en: "100% natural", mr: "१००% नैसर्गिक" },
  "why.r1.d": {
    en: "Turmeric, sandalwood, neem, aloe — only pure Ayurvedic ingredients. Zero chemicals.",
    mr: "हळद, चंदन, कडुलिंब, कोरफड — फक्त शुद्ध आयुर्वेदिक घटक. कोणतेही केमिकल नाही.",
  },
  "why.r2.t": { en: "Small-batch, handmade", mr: "लहान बॅच, हस्तनिर्मित" },
  "why.r2.d": {
    en: "Each product is hand-crafted in tiny batches — guaranteed freshness and quality.",
    mr: "प्रत्येक उत्पादन छोट्या बॅचमध्ये हाताने तयार — ताजेपणा आणि गुणवत्तेची हमी.",
  },
  "why.r3.t": { en: "Paraben & sulphate-free", mr: "पॅराबेन व सल्फेटमुक्त" },
  "why.r3.d": {
    en: "A gentle formula — safe even for sensitive skin.",
    mr: "त्वचेला त्रास न देणारी सौम्य फॉर्म्युला — संवेदनशील त्वचेसाठीही सुरक्षित.",
  },
  "why.r4.t": { en: "Cruelty-free", mr: "क्रूरतामुक्त" },
  "why.r4.d": {
    en: "No animal testing. Vegan-friendly ingredients first.",
    mr: "कोणत्याही प्राण्यांवर चाचणी नाही. व्हीगन-फ्रेंडली घटकांना प्राधान्य.",
  },
  "why.r5.t": { en: "Eco-friendly packaging", mr: "पर्यावरणपूरक पॅकेजिंग" },
  "why.r5.d": {
    en: "Reusable jars and minimal plastic — for the earth's beauty too.",
    mr: "पुनर्वापरयोग्य कंटेनर आणि कमीत कमी प्लास्टिक — पृथ्वीच्या सौंदर्यासाठीही.",
  },
  "why.r6.t": { en: "Generations-old recipes", mr: "पिढ्यानपिढ्यांच्या पाककृती" },
  "why.r6.d": {
    en: "Grandmothers' traditional ubtan recipes, modernised for you.",
    mr: "आजी-पणजीच्या पारंपरिक उटण्यांच्या रेसिपी, आधुनिक रूपात तुमच्यासाठी.",
  },

  // Offers
  "offers.eyebrow": { en: "Special offers", mr: "खास ऑफर" },
  "offers.title.1": { en: "Limited-time", mr: "मर्यादित काळासाठी" },
  "offers.title.2": { en: "discounts", mr: "सवलती" },
  "offers.subtitle": {
    en: "Special launch offers on Kanti's selected essentials — order before stock runs out.",
    mr: "कांतीच्या निवडक उत्पादनांवर विशेष लाँच ऑफर — स्टॉक संपण्यापूर्वी ऑर्डर करा.",
  },

  // Hampers
  "hampers.eyebrow": { en: "For special occasions", mr: "खास प्रसंगांसाठी" },
  "hampers.title.1": { en: "Custom hampers for", mr: "प्रत्येक प्रसंगासाठी" },
  "hampers.title.2": { en: "every occasion", mr: "कस्टम हॅम्पर" },
  "hampers.subtitle": {
    en: "Bespoke hampers of Kanti's products for Diwali, Haldi-Kunku, wedding return-gifts and corporate gifting — assembled to your taste.",
    mr: "दिवाळी, हळदी-कुंकू, लग्नाचे रिटर्न गिफ्ट आणि कॉर्पोरेट गिफ्टिंगसाठी आपल्या आवडीनुसार कांतीच्या उत्पादनांचा खास हॅम्पर तयार करून मिळेल.",
  },
  "hampers.cta": { en: "Enquire on WhatsApp", mr: "व्हॉट्सअ‍ॅपवर चौकशी करा" },
  "hampers.occ.diwali": { en: "Diwali", mr: "दिवाळी" },
  "hampers.occ.haldi": { en: "Haldi-Kunku", mr: "हळदी-कुंकू" },
  "hampers.occ.wedding": { en: "Wedding", mr: "लग्न" },
  "hampers.occ.return": { en: "Return gifts", mr: "रिटर्न गिफ्ट" },
  "hampers.occ.corp": { en: "Corporate", mr: "कॉर्पोरेट" },
  "hampers.wa.msg": {
    en: "Hi Kanti, I'd like more info about a custom hamper.",
    mr: "नमस्कार कांती, मला कस्टम हॅम्परबद्दल माहिती हवी आहे.",
  },

  // How
  "how.eyebrow": { en: "How to order", mr: "ऑर्डर कशी करायची" },
  "how.title.1": { en: "Easy shopping with", mr: "सोपी खरेदी," },
  "how.title.2": { en: "WhatsApp checkout", mr: "व्हॉट्सअ‍ॅप चेकआउट" },
  "how.s1.t": { en: "Pick a product", mr: "उत्पादन निवडा" },
  "how.s1.d": {
    en: "Choose your favourite Kanti product and read the details.",
    mr: "आवडीचे कांती उत्पादन निवडा आणि माहिती वाचा.",
  },
  "how.s2.t": { en: "Add to cart", mr: "कार्टमध्ये टाका" },
  "how.s2.d": {
    en: "Hit Add to Cart or click Buy Now directly.",
    mr: "Add to Cart करा किंवा थेट Buy Now वर क्लिक करा.",
  },
  "how.s3.t": { en: "Order on WhatsApp", mr: "व्हॉट्सअ‍ॅपवर ऑर्डर" },
  "how.s3.d": {
    en: "After checkout, send the auto-prepared order on WhatsApp.",
    mr: "चेकआउट केल्यावर तयार ऑर्डर मेसेज व्हॉट्सअ‍ॅपवर पाठवा.",
  },

  // Founder
  "founder.eyebrow": { en: "Founder's note", mr: "संस्थापिकेचे मनोगत" },
  "founder.title": {
    en: "From grandma's ubtan to House Of Kanti — the journey",
    mr: "आजीच्या उटण्यापासून हाऊस ऑफ कांती पर्यंतचा प्रवास",
  },
  "founder.p1": {
    en: "As a child, every Sunday Aaji would apply ubtan made of turmeric, sandalwood and gram flour. In that fragrance and gentle touch was a love that today's chemical creams simply cannot match.",
    mr: "लहानपणी प्रत्येक रविवारी आजी हळद, चंदन आणि बेसनाचे उटणे लावायची. त्या सुगंधात आणि मृदू स्पर्शात एक प्रेम होतं — जे आजच्या बाजारातल्या केमिकलयुक्त क्रीममध्ये कुठेच सापडत नाही.",
  },
  "founder.p2": {
    en: "House Of Kanti is the modern form of those memories. Every product is hand-made in my own kitchen, in small batches — because what touches your skin must be honest.",
    mr: "हाऊस ऑफ कांती हे त्याच आठवणींचं आधुनिक रूप आहे. प्रत्येक उत्पादन माझ्या स्वयंपाकघरात, छोट्या बॅचमध्ये, हाताने तयार होतं — कारण तुमच्या त्वचेवर जे लागतं, ते प्रामाणिक असायलाच हवं.",
  },
  "founder.quote": {
    en: '"Where purity meets glow — that is House Of Kanti."',
    mr: '"शुद्धता तिथे तेज — हीच हाऊस ऑफ कांतीची ओळख."',
  },
  "founder.signoff": { en: "— The House Of Kanti family", mr: "— हाऊस ऑफ कांती परिवार" },

  // Contact
  "contact.eyebrow": { en: "Talk to us", mr: "आमच्याशी बोला" },
  "contact.title.1": { en: "Start your", mr: "तुमचा" },
  "contact.title.2": { en: "natural glow today", mr: "नैसर्गिक तेज आजच सुरू करा" },
  "contact.subtitle": {
    en: "Got a question? Reach us directly.",
    mr: "काही शंका आहे का? आमच्याशी थेट संपर्क करा.",
  },
  "contact.phone": { en: "Phone", mr: "फोन" },
  "contact.wa": { en: "WhatsApp", mr: "व्हॉट्सअ‍ॅप" },
  "contact.wa.value": { en: "Order in one click", mr: "एका क्लिकमध्ये ऑर्डर" },
  "contact.email": { en: "Email", mr: "ईमेल" },
  "contact.ig": { en: "Instagram", mr: "इंस्टाग्राम" },

  // Footer
  "footer.tagline": {
    en: "Natural skincare hand-crafted from turmeric, sandalwood and herbs.",
    mr: "हळद, चंदन आणि औषधी वनस्पतींपासून हाताने बनवलेली नैसर्गिक स्किनकेअर.",
  },
  "footer.contact": { en: "Contact", mr: "संपर्क" },
  "footer.explore": { en: "Explore", mr: "पहा" },
  "footer.products": { en: "Products", mr: "उत्पादने" },
  "footer.hampers": { en: "Custom hampers", mr: "कस्टम हॅम्पर" },
  "footer.how": { en: "How to order", mr: "ऑर्डर कशी करायची" },
  "footer.copy": { en: "Hand-crafted with love in India.", mr: "भारतात प्रेमाने हस्तनिर्मित." },

  // About page
  "nav.about": { en: "About", mr: "आमच्याबद्दल" },
  "about.eyebrow": { en: "Our story", mr: "आमची कथा" },
  "about.hero.title.1": { en: "Where", mr: "जिथे" },
  "about.hero.title.purity": { en: "Purity", mr: "शुद्धता" },
  "about.hero.title.2": { en: "Meets Glow", mr: "तिथे तेज" },
  "about.hero.p1": {
    en: "House Of Kanti is a holistic skincare sanctuary dedicated to the transformative power of the botanical world. Inspired by the timeless wisdom of Ayurveda, we craft clean, high-performance and luxurious rituals that celebrate your skin's health — without compromise.",
    mr: "हाऊस ऑफ कांती हे एक समग्र स्किनकेअर सॅंक्च्युअरी आहे — वनस्पती जगताच्या परिवर्तनकारी शक्तीला समर्पित. आयुर्वेदाच्या कालातीत ज्ञानावर आधारित, आम्ही शुद्ध, उच्च-प्रभावी आणि भव्य रिच्युअल्स तयार करतो जे कोणतीही तडजोड न करता तुमच्या त्वचेच्या आरोग्याचा सन्मान करतात.",
  },
  "about.hero.p2.a": { en: "The name", mr: "‘कांती’ या" },
  "about.hero.p2.b": {
    en: "translates to a luminous, natural glow — a radiance that reflects both outer vitality and inner harmony. Our brand is built on three pillars:",
    mr: "नावाचा अर्थ आहे तेजस्वी, नैसर्गिक चमक — जी बाह्य चैतन्य आणि अंतर्गत सुसंवाद दोन्ही दर्शवते. आमचा ब्रँड तीन स्तंभांवर उभा आहे:",
  },
  "about.hero.pillars": {
    en: "Purity, Authenticity, and Mindful Self-Care.",
    mr: "शुद्धता, प्रामाणिकता आणि सजग आत्म-काळजी.",
  },

  "about.vision.eyebrow": { en: "Vision", mr: "दृष्टी" },
  "about.vision.title": {
    en: "A global home for botanical skincare",
    mr: "वनस्पती-आधारित स्किनकेअरचे जागतिक घर",
  },
  "about.vision.desc": {
    en: "To be a globally recognized leader in botanical skincare, empowering individuals to achieve radiant health through the fusion of nature and Ayurveda.",
    mr: "वनस्पती-आधारित स्किनकेअरमध्ये जागतिक स्तरावर ओळखले जाणारे अग्रणी बनणे, निसर्ग आणि आयुर्वेदाच्या संगमातून प्रत्येक व्यक्तीला तेजस्वी आरोग्य मिळवून देणे.",
  },
  "about.mission.eyebrow": { en: "Mission", mr: "ध्येय" },
  "about.mission.title": {
    en: "Tradition, made effective for today",
    mr: "परंपरा, आजसाठी प्रभावी",
  },
  "about.mission.desc": {
    en: "To bring high-quality, traditional Ayurvedic formulations to the international stage — ensuring every product is as safe as it is effective.",
    mr: "उच्च-गुणवत्तेच्या पारंपरिक आयुर्वेदिक फॉर्म्युलेशनला आंतरराष्ट्रीय व्यासपीठावर आणणे — प्रत्येक उत्पादन जितके प्रभावी, तितकेच सुरक्षित असेल याची खात्री.",
  },

  "about.story.eyebrow": { en: "The Return to Purity", mr: "शुद्धतेकडे परतीचा प्रवास" },
  "about.story.title": { en: "Our brand story", mr: "आमची ब्रँड कथा" },
  "about.story.p1": {
    en: "House Of Kanti was born from a passion for ancestral beauty rituals and a desire to provide a clean alternative to the chemical-heavy products of the modern world. We believe skincare should be an act of healing — nourishing the skin while honoring the earth.",
    mr: "हाऊस ऑफ कांतीचा जन्म पारंपरिक सौंदर्य रिच्युअल्सच्या आवडीतून आणि आधुनिक जगातील केमिकलयुक्त उत्पादनांना शुद्ध पर्याय देण्याच्या इच्छेतून झाला. आमचा विश्वास आहे की स्किनकेअर ही एक उपचार-क्रिया असावी — त्वचेचे पोषण करताना पृथ्वीचाही सन्मान करणारी.",
  },
  "about.story.p2": {
    en: "By marrying ancient Ayurvedic knowledge with modern formulation science, we create gentle yet potent solutions for the modern lifestyle. Every Kanti product is the result of meticulous research and a steadfast commitment to quality.",
    mr: "प्राचीन आयुर्वेदिक ज्ञान आणि आधुनिक फॉर्म्युलेशन शास्त्र यांचा संगम साधून, आम्ही आधुनिक जीवनशैलीसाठी सौम्य पण प्रभावी उपाय तयार करतो. प्रत्येक कांती उत्पादन हे काटेकोर संशोधन आणि गुणवत्तेच्या निष्ठेचे फळ आहे.",
  },

  "about.heroes.eyebrow": { en: "Heritage in every drop", mr: "प्रत्येक थेंबात परंपरा" },
  "about.heroes.title.1": { en: "The Kanti", mr: "कांतीचे" },
  "about.heroes.title.hero": { en: "hero", mr: "मुख्य" },
  "about.heroes.title.2": { en: "ingredients", mr: "घटक" },
  "about.heroes.subtitle": {
    en: "Every ingredient we select tells a story of heritage and efficacy.",
    mr: "आम्ही निवडलेला प्रत्येक घटक परंपरा आणि परिणामकारकतेची कहाणी सांगतो.",
  },
  "about.hero.saffron.name": { en: "Saffron (Kesar)", mr: "केशर" },
  "about.hero.saffron.desc": {
    en: "“The Gold of Ayurveda” — brightens the complexion and diminishes pigmentation for a radiant finish.",
    mr: "“आयुर्वेदाचे सोने” — रंग उजळवते आणि डाग कमी करून तेजस्वी चमक देते.",
  },
  "about.hero.sandal.name": { en: "Sandalwood (Chandan)", mr: "चंदन" },
  "about.hero.sandal.desc": {
    en: "A cooling botanical that calms inflammation and offers a grounding, sensory aroma.",
    mr: "थंडावा देणारी वनस्पती जी जळजळ कमी करते आणि शांत, सुगंधी अनुभव देते.",
  },
  "about.hero.turmeric.name": { en: "Turmeric (Haldi)", mr: "हळद" },
  "about.hero.turmeric.desc": {
    en: "A legendary anti-inflammatory that purifies skin, fights blemishes and restores a healthy tone.",
    mr: "प्रसिद्ध दाहशामक जी त्वचा शुद्ध करते, डागांशी लढते आणि निरोगी रंग परत आणते.",
  },
  "about.hero.rose.name": { en: "Rose (Gulab)", mr: "गुलाब" },
  "about.hero.rose.desc": {
    en: "Hydrates and tones while its delicate scent promotes emotional balance and relaxation.",
    mr: "त्वचेला हायड्रेट व टोन करते, तर त्याचा नाजूक सुगंध मानसिक संतुलन व शांती देतो.",
  },
  "about.hero.clay.name": { en: "Clays & Milk", mr: "माती आणि दूध" },
  "about.hero.clay.desc": {
    en: "Time-honored cleansers that exfoliate and lift impurities without stripping the skin's natural oils.",
    mr: "पारंपरिक क्लीन्झर्स जे त्वचेची नैसर्गिक तेले न काढता अशुद्धी दूर करतात.",
  },

  "about.coll.eyebrow": { en: "The signature collection", mr: "सिग्नेचर कलेक्शन" },
  "about.coll.title": { en: "Rituals, not routines", mr: "केवळ दिनचर्या नव्हे — रिच्युअल्स" },
  "about.coll.benefits": { en: "Key benefits:", mr: "मुख्य फायदे:" },
  "about.coll.ritual": { en: "Ritual:", mr: "रिच्युअल:" },
  "about.coll.ubtan.title": { en: "Ubtan — The Natural Cleanser", mr: "उटणे — नैसर्गिक क्लीन्झर" },
  "about.coll.ubtan.b": {
    en: "Removes tan, brightens tone, and refines texture.",
    mr: "टॅन काढते, रंग उजळवते आणि त्वचा गुळगुळीत करते.",
  },
  "about.coll.ubtan.r": {
    en: "Blend with milk or rose water into a paste. Massage in, rest 15 minutes, rinse to reveal a luminous complexion.",
    mr: "दूध किंवा गुलाबजलात पेस्ट बनवा. मसाज करून १५ मिनिटे ठेवा, मग धुवा — तेजस्वी रंग पाहा.",
  },
  "about.coll.pack.title": { en: "Face Pack — The Detox Ritual", mr: "फेस पॅक — डिटॉक्स रिच्युअल" },
  "about.coll.pack.b": {
    en: "Controls excess oil, minimizes pores, and smooths skin texture.",
    mr: "अतिरिक्त तेल नियंत्रित करते, छिद्रे कमी करते आणि त्वचा गुळगुळीत करते.",
  },
  "about.coll.pack.r": {
    en: "Mix with rose water, apply to a clean face, wash off after 15 minutes for a revitalized glow.",
    mr: "गुलाबजलात मिसळून स्वच्छ चेहऱ्यावर लावा, १५ मिनिटांनी धुवा — ताजेतवाने तेज मिळेल.",
  },
  "about.coll.oil.title": {
    en: "Kumkumadi Night Oil & Gel — The Overnight Elixir",
    mr: "कुंकुमादी नाईट ऑईल व जेल — रात्रीचे अमृत",
  },
  "about.coll.oil.b": {
    en: "Targets dark spots, boosts elasticity and provides deep hydration.",
    mr: "काळे डाग कमी करते, त्वचेची लवचिकता वाढवते आणि खोल हायड्रेशन देते.",
  },
  "about.coll.oil.r": {
    en: "Warm 2–3 drops (oil) or a pearl-sized amount (gel). Massage upward in circular motions. Leave overnight.",
    mr: "२–३ थेंब (तेल) किंवा मोत्याएवढे (जेल) कोमट करा. वर्तुळाकार वरच्या दिशेने मसाज करा. रात्रभर तसेच ठेवा.",
  },
  "about.coll.salt.title": {
    en: "Bath Salt — The Spa Sanctuary",
    mr: "बाथ सॉल्ट — स्पा सॅंक्च्युअरी",
  },
  "about.coll.salt.b": {
    en: "Dissolves stress, detoxifies the body, and promotes deep, restful sleep.",
    mr: "ताण दूर करते, शरीर डिटॉक्स करते आणि गाढ शांत झोप देते.",
  },
  "about.coll.salt.r": {
    en: "Dissolve 2 tablespoons in a warm bath. Soak for 20 minutes to nourish and soften skin.",
    mr: "२ चमचे कोमट पाण्यात विरघळवा. २० मिनिटे भिजल्याने त्वचा पोषित व मऊ होईल.",
  },

  "about.modern.eyebrow": { en: "The modern necessity", mr: "आधुनिक गरज" },
  "about.modern.title.1": { en: "Why", mr: "आज" },
  "about.modern.title.ayur": { en: "Ayurveda", mr: "आयुर्वेद" },
  "about.modern.title.2": { en: ", now", mr: "का?" },
  "about.modern.subtitle": {
    en: "In a world of pollution and stress, your skin needs more than a temporary fix. Ayurveda offers a balanced, long-term approach that treats the root cause rather than just the symptoms.",
    mr: "प्रदूषण आणि ताणाच्या युगात, तुमच्या त्वचेला तात्पुरत्या उपायांपेक्षा अधिक हवे आहे. आयुर्वेद केवळ लक्षणांवर नव्हे, मूळ कारणावर उपचार करणारा संतुलित, दीर्घकालीन दृष्टिकोन देतो.",
  },
  "about.pillar1.t": { en: "Botanical Integrity", mr: "वनस्पती-आधारित प्रामाणिकता" },
  "about.pillar1.d": {
    en: "Plant-based extracts and no harsh chemicals.",
    mr: "वनस्पतीजन्य अर्क आणि कोणतेही कठोर केमिकल नाही.",
  },
  "about.pillar2.t": { en: "Conscious Processes", mr: "जागरूक प्रक्रिया" },
  "about.pillar2.d": {
    en: "Sustainable methods that respect nature.",
    mr: "निसर्गाचा सन्मान करणाऱ्या शाश्वत पद्धती.",
  },
  "about.pillar3.t": { en: "Daily Rituals", mr: "दैनंदिन रिच्युअल्स" },
  "about.pillar3.d": {
    en: "Transforming skincare into a mindful moment of self-love.",
    mr: "स्किनकेअरला आत्मप्रेमाच्या सजग क्षणात रूपांतरित करणे.",
  },
  "about.tagline": {
    en: "House Of Kanti — Where Purity Meets Glow.",
    mr: "हाऊस ऑफ कांती — शुद्धता तिथे तेज.",
  },
} satisfies Dict;

export type DictKey = keyof typeof dict;

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: DictKey) => string;
};

const LanguageContext = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("kanti.lang") as Lang | null;
      if (saved === "en" || saved === "mr") setLangState(saved);
    } catch (err) {
      console.warn(err);
    }
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem("kanti.lang", l);
    } catch (err) {
      console.warn(err);
    }
  };

  const t = (key: DictKey) => dict[key]?.[lang] ?? "";

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>{children}</LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used inside LanguageProvider");
  return ctx;
}
