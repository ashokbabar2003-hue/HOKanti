ALTER TABLE public.products ADD COLUMN IF NOT EXISTS seo_description TEXT;

UPDATE public.products SET seo_description = 'कांती उटणे — हळद, चंदन, बेसन आणि गुलाब पाकळ्यांपासून बनलेले पारंपरिक आयुर्वेदिक उटणे. नैसर्गिक चमक, टॅन रिमूव्हल आणि मऊ त्वचेसाठी हस्तनिर्मित स्किनकेअर.' WHERE slug = 'ubtan';

UPDATE public.products SET seo_description = 'कांती फेस मास्क — मुलतानी माती, कडुलिंब आणि कोरफडीचा शुद्ध हर्बल फेस मास्क. तेलकट त्वचा, मुरुमे आणि डागांवर प्रभावी, थंडावा देणारा आयुर्वेदिक उपाय.' WHERE slug = 'face-mask';

UPDATE public.products SET seo_description = 'कांती बाथ सॉल्ट — हिमालयन पिंक सॉल्ट, एप्सम सॉल्ट आणि लॅव्हेंडर ऑइलचे स्पा-दर्जाचे मिश्रण. स्नायूंचा थकवा घालवण्यासाठी आणि शांत आरामदायी आंघोळीसाठी.' WHERE slug = 'bath-salt';

UPDATE public.products SET seo_description = 'कांती बाथ साबण — हस्तनिर्मित नैसर्गिक हर्बल साबण, हळद आणि औषधी वनस्पतींनी समृद्ध. पॅराबेन व केमिकलमुक्त, सर्व त्वचेसाठी सौम्य.' WHERE slug = 'bath-soap';

UPDATE public.products SET seo_description = 'कांती फेस ऑइल — जोजोबा, आर्गन ऑइल आणि व्हिटॅमिन ई असलेले हलके फेशियल ऑइल. अँटी-एजिंग, खोल हायड्रेशन आणि नैसर्गिक चमकेसाठी आयुर्वेदिक तेल.' WHERE slug = 'face-oil';