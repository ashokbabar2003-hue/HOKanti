-- Seed products catalog
INSERT INTO public.products (
  id,
  slug,
  name,
  subtitle_mr,
  subtitle_en,
  description,
  price,
  original_price,
  image_url,
  in_stock,
  sort_order,
  seo_description,
  variants
)
VALUES
(
  '9f257b4f-8367-4f6c-94cc-ae4be9821817',
  'ubtan',
  'Kanti Ubtan — The Natural Cleanser',
  'त्वचेचा तजेलदारपणा आणि कांती वाढवण्यासाठी',
  'For skin radiance & brightening',
  $$हे पारंपारिक भारतीय उटणे आहे, जे त्वचेला नैसर्गिक चमक देण्यासाठी आणि रंग सुधारण्यासाठी डिझाइन केलेले आहे.

प्रमुख घटक: हळद, चंदन पावडर, बेसन, गुलाब पाकळ्या.

फायदे: त्वचेवरील मृत पेशी काढून टाकते (Exfoliates), काळे डाग कमी करते, त्वचेला मऊ आणि सतेज बनवते.

कसे वापरावे: पावडरमध्ये दूध किंवा गुलाब पाणी मिसळून पेस्ट तयार करा. चेहऱ्यावर आणि शरीरावर लावा. वाळल्यानंतर हलक्या हाताने घासून धुवा.$$,
  79.00,
  NULL,
  '/src/assets/product-ubtan.jpg',
  true,
  1,
  'कांती उटणे — हळद, चंदन, बेसन आणि गुलाब पाकळ्यांपासून बनलेले पारंपरिक आयुर्वेदिक उटणे. नैसर्गिक चमक, टॅन रिमूव्हल आणि मऊ त्वचेसाठी हस्तनिर्मित स्किनकेअर.',
  '[{"size": "50 gm", "label": "Pouch · 50 gm", "price": 79, "packaging": "Pouch"}, {"size": "50 gm", "label": "Jar · 50 gm", "price": 99, "packaging": "Jar"}, {"size": "25 gm", "label": "Jar · 25 gm", "price": 49, "packaging": "Jar"}]'::jsonb
),
(
  'ce53afa9-c896-4c2c-ae1e-9335fde52d04',
  'face-mask',
  'Kanti Face Pack — The Detox Ritual',
  'Cooling आणि tan removal',
  'Cooling & tan removal',
  $$परिचय: नैसर्गिक माती आणि आयुर्वेदिक जडीबुटींनी बनलेला हा फेस मास्क त्वचेला खोलवर स्वच्छ करतो.

प्रमुख घटक: मुलतानी माती (Kaolin Clay), कडुलिंब पावडर, कोरफड अर्क.

फायदे: त्वचेवरील अतिरिक्त तेल काढून टाकतो (Controls excess oil), मुरुमे आणि डाग कमी करतो, त्वचेला ताजेतवाने बनवतो.

कसे वापरावे: पेस्ट चेहऱ्यावर लावा आणि १५-२० मिनिटे राहू द्या. वाळल्यानंतर पाण्याने धुवा.$$,
  49.00,
  NULL,
  '/src/assets/product-facemask.jpg',
  true,
  2,
  'कांती फेस मास्क — मुलतानी माती, कडुलिंब आणि कोरफडीचा शुद्ध हर्बल फेस मास्क. तेलकट त्वचा, मुरुमे आणि डागांवर प्रभावी, थंडावा देणारा आयुर्वेदिक उपाय.',
  '[{"size": "50 gm", "label": "Pouch · 50 gm", "price": 79, "packaging": "Pouch"}, {"size": "50 gm", "label": "Jar · 50 gm", "price": 99, "packaging": "Jar"}, {"size": "25 gm", "label": "Jar · 25 gm", "price": 49, "packaging": "Jar"}]'::jsonb
),
(
  'bbed56e3-265c-457b-92d2-68fd85c3741b',
  'bath-salt',
  'Kanti Bath Salt — The Spa Sanctuary',
  'Relaxing soak साठी',
  'For a relaxing soak',
  $$परिचय: हिमालयातील शुद्ध क्षीर आणि नैसर्गिक तेलांचे मिश्रण, जे तुमच्या आंघोळीच्या पाण्याला एक स्पा-सारखा अनुभव देते.

प्रमुख घटक: गुलाबी हिमालयीन मीठ, एप्सम सॉल्ट, लॅव्हेंडर ऑइल, जोजोबा ऑइल.

फायदे: स्नायूंचा ताण कमी करते (Relieves muscle tension), त्वचेला डिटॉक्स करते, मन शांत करते आणि चांगली झोप लागण्यास मदत करते.

कसे वापरावे: कोमट पाण्याच्या बादलीत किंवा टबमध्ये २-३ चमचे बाथ सॉल्ट टाका आणि विरघळू द्या.$$,
  79.00,
  NULL,
  '/src/assets/product-bathsalt.jpg',
  true,
  3,
  'कांती बाथ सॉल्ट — |हिमालयन पिंक सॉल्ट, एप्सम सॉल्ट आणि लॅव्हेंडर ऑइलचे स्पा-दर्जाचे मिश्रण. स्नायूंचा थकवा घालवण्यासाठी आणि शांत आरामदायी आंघोळीसाठी.',
  '[{"size": "200 gm", "label": "Jar · 200 gm", "price": 299, "packaging": "Jar"}, {"size": "50 gm", "label": "Jar · 50 gm", "price": 79, "packaging": "Jar"}, {"size": "80 gm", "label": "Pouch · 80 gm", "price": 99, "packaging": "Pouch"}]'::jsonb
),
(
  'ad0f1dd4-cdb7-452d-a0d7-6ae1d50258f2',
  'soap',
  'Kanti Ancient Glow Soap',
  'Neem आणि turmeric',
  'Neem & turmeric',
  $$परिचय: लॅव्हेंडर आणि औषधी वनस्पतींच्या सुगंधाने भरलेला, हाताने तयार केलेला हा साबण त्वचेला मऊ आणि स्वच्छ करतो.

प्रमुख घटक: खोबरेल तेल, शिया बटर, लॅव्हेंडर इसेन्शियल ऑइल, वाळलेल्या औषधी वनस्पती.

फायदे: त्वचेला कोरडे न करता स्वच्छ करते (Gentle cleansing), त्वचेला मॉइश्चराइझ करते आणि दीर्घकाळ सुगंध टिकतो.

कसे वापरावे: रोजच्या आंघोळीसाठी वापरा.$$,
  80.00,
  NULL,
  '/src/assets/product-soap.jpg',
  true,
  4,
  'कांती बाथ साबण — हस्तनिर्मित नैसर्गिक हर्बल साबण, हळद आणि औषधी वनस्पतींनी समृद्ध. पॅराबेन व केमिकलमुक्त, सर्व त्वचेसाठी सौम्य.',
  '[{"size": "100 gm", "label": "100 gm", "price": 80, "packaging": "-"}]'::jsonb
),
(
  '60b8a2c6-0d2f-48eb-835b-3196bb778276',
  'face-serum',
  'Kanti Kumkumadi Night — The Overnight Elixir',
  'Marigold आणि sandalwood',
  'Marigold & sandalwood',
  $$परिचय: त्वचेला पोषण देणारे आणि चमक वाढवणारे हे एक हलके फेशियल ऑइल आहे.

प्रमुख घटक: जोजोबा ऑइल, आर्गन ऑइल, व्हिटॅमिन ई, गुलाब पाकळ्यांचा अर्क.

फायदे: त्वचेला खोलवर हायड्रेट करते, सुरकुत्या कमी करण्यास मदत करते (Anti-aging), त्वचेला नैसर्गिक चमक देते.

कसे वापरावे: रात्री झोपण्यापूर्वी २-३ थेंब चेहऱ्यावर लावा आणि हलक्या हाताने मालिश करा.$$,
  449.00,
  NULL,
  '/src/assets/product-faceoil.jpg',
  true,
  5,
  'कांती Face Oil — जोजोबा, आर्गन ऑइल आणि व्हिटॅमिन ई असलेले हलके फेशियल ऑइल. अँटी-एजिंग, खोल हायड्रेशन आणि नैसर्गिक चमकेसाठी आयुर्वेदिक तेल.',
  '[{"size": "15 ml", "label": "Oil", "price": 449, "packaging": "Glass bottle"}, {"size": "50 gm", "label": "Gel", "price": 449, "packaging": "Jar"}, {"size": "Oil 15 ml + Gel 50 gm", "label": "Combo", "price": 749, "packaging": "Set"}]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name = EXCLUDED.name,
  subtitle_mr = EXCLUDED.subtitle_mr,
  subtitle_en = EXCLUDED.subtitle_en,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image_url = EXCLUDED.image_url,
  in_stock = EXCLUDED.in_stock,
  sort_order = EXCLUDED.sort_order,
  seo_description = EXCLUDED.seo_description,
  variants = EXCLUDED.variants,
  updated_at = now();
