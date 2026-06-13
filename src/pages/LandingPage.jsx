import { useEffect, useRef, useState } from 'react';
import './LandingPage.css';

// ── Language content ──────────────────────────────────────────────────────────
const CONTENT = {
  en: {
    nav: { home:'Home', problem:'Problem', solution:'Solution', features:'Features', impact:'Impact', demo:'Demo', contact:'Contact', login:'Login', start:'Get Started' },
    hero: {
      badge: '🇪🇹 Made in Ethiopia • For Ethiopian Women',
      h1: 'Empowering Ethiopian Women Through Smart Business Management',
      h2: 'Your Voice. Your Text. Your Business Power.',
      desc: 'Manage products, inventory, sales, and reports using voice commands or simple text input. Built for Ethiopian women entrepreneurs who want technology that is easy, accessible, and powerful.',
      cta1: '🚀 Try the Platform', cta2: '▶ Watch Demo',
    },
    stats: ['2M+\nWomen Entrepreneurs','100%\nAmharic Support','Voice + Text\nFlexible Input','24/7\nBusiness Management'],
    problem: {
      badge: 'The Challenge',
      h2: 'Millions of Women Entrepreneurs Still Manage Businesses Manually',
      items: [
        { icon:'📋', title:'Paper Records Get Lost', desc:'Important business data disappears when notebooks are misplaced or damaged.' },
        { icon:'📦', title:'Inventory Is Hard to Track', desc:'Manual counting leads to errors, stockouts, and missed opportunities.' },
        { icon:'🧮', title:'Revenue Calculations Take Time', desc:'Hours spent doing math that technology could handle in seconds.' },
        { icon:'💻', title:'Digital Tools Are Too Complicated', desc:'Existing software requires technical skills most entrepreneurs don\'t have.' },
        { icon:'⏰', title:'Time Is Wasted on Paperwork', desc:'Valuable time that could be spent on growing the business.' },
      ],
      impact: 'More than 2 Million Ethiopian Women Entrepreneurs Deserve Better Tools',
    },
    solution: {
      badge: 'The Solution',
      h2: 'One Platform. Multiple Ways To Work.',
      voice: { title:'🎤 Voice Commands', ex:'"ሸጥኩ ሱሪ አምስት" (I sold 5 dresses)', items:['✓ Records the sale','✓ Updates inventory','✓ Calculates revenue','✓ Generates report'] },
      text:  { title:'⌨️ Text Input', ex:'"Add 10 new handbags to inventory"', items:['✓ Updates stock instantly','✓ No typing skills needed','✓ Simple Amharic or English','✓ Instant confirmation'] },
    },
    howit: {
      badge: 'How It Works',
      h2: 'Simple. Fast. Designed For Everyone.',
      steps: [
        { icon:'🎤', n:'01', title:'Speak or Type', desc:'Use your voice in Amharic or type a simple command. No special training needed.' },
        { icon:'⚙️', n:'02', title:'Smart Processing', desc:'Our system understands your language and processes your business request instantly.' },
        { icon:'📊', n:'03', title:'Instant Updates', desc:'Inventory, sales, revenue, and reports update automatically in real time.' },
      ],
    },
    features: {
      badge: 'Features',
      h2: 'Everything Needed To Run A Business',
      items: [
        { icon:'🎤', title:'Voice Commands', desc:'Speak naturally in Amharic to manage your business hands-free.' },
        { icon:'⌨️', title:'Text Input', desc:'Type simple commands in Amharic or English anytime.' },
        { icon:'📦', title:'Inventory Management', desc:'Track all products with quantities, categories, and low-stock alerts.' },
        { icon:'💰', title:'Revenue Tracking', desc:'Monitor daily earnings in Ethiopian Birr automatically.' },
        { icon:'📊', title:'Smart Reports', desc:'Generate business summaries with one tap.' },
        { icon:'📶', title:'Works Offline', desc:'Full functionality even without internet connection.' },
        { icon:'📱', title:'Mobile Friendly', desc:'Designed for smartphones. Works on any Android or iPhone.' },
        { icon:'📤', title:'WhatsApp Sharing', desc:'Share your inventory and reports directly via WhatsApp.' },
        { icon:'📄', title:'PDF Export', desc:'Professional PDF reports for banks, suppliers, and partners.' },
        { icon:'🔒', title:'Secure PIN Login', desc:'Simple 4-digit PIN. No email or password required.' },
        { icon:'🌍', title:'Full Amharic Support', desc:'Complete Ethiopian language support throughout the platform.' },
        { icon:'⚡', title:'Fast & Easy', desc:'Designed for non-technical users. Anyone can use it in minutes.' },
      ],
    },
    empowerment: {
      badge: 'Real Impact',
      h2: 'Built For Women. Built For Growth.',
      story: 'Samrawit runs a clothing business in Gondar, Ethiopia. Like millions of Ethiopian women entrepreneurs, she spent hours every week writing records, calculating revenue, and trying to keep track of her inventory.',
      before: { title:'Before HAGERE VOICE', items:['📓 Paper notebooks that get lost','🧮 Manual calculations every evening','❌ No clear picture of profits','📦 Stockouts without warning','⏰ Hours wasted on paperwork'] },
      after:  { title:'After HAGERE VOICE', items:['🎤 Voice updates in seconds','💰 Real-time revenue in Birr','✅ Always knows her stock levels','📊 Professional reports instantly','⏰ More time for her customers'] },
      quote: '"Technology should work for me, not against me. HAGERE VOICE understands my language and my business."',
      name: '— Mastewal, Clothing Business Owner, Gondar',
    },
    demo: {
      badge: 'Product Demo',
      h2: 'See The Platform In Action',
      screens: ['Dashboard Overview','Inventory Management','Voice Command Interface','Sales & Revenue','Reports & Export','Analytics'],
    },
    impact: {
      badge: 'Our Impact',
      h2: 'Technology That Creates Opportunity',
      stats: [
        { n:'2M+', label:'Potential Women Entrepreneurs in Ethiopia' },
        { n:'100%', label:'Amharic Language Support' },
        { n:'0', label:'Technical Skills Required' },
        { n:'24/7', label:'Business Management Capability' },
      ],
    },
    why: {
      badge: 'Why It Matters',
      h2: 'More Than Software',
      desc: 'HAGERE VOICE is a mission to bring digital empowerment to every Ethiopian woman entrepreneur.',
      items: [
        { icon:'👩‍💼', title:"Women's Economic Empowerment", desc:'Giving women tools to manage and grow their businesses independently.' },
        { icon:'💳', title:'Financial Independence', desc:'Better business records lead to better access to loans and microfinance.' },
        { icon:'📱', title:'Digital Inclusion', desc:'Making technology accessible to those traditionally left behind.' },
        { icon:'🏪', title:'Small Business Growth', desc:'Helping local businesses compete and thrive in a modern economy.' },
        { icon:'🌱', title:'Local Entrepreneurship', desc:'Supporting the backbone of the Ethiopian economy.' },
        { icon:'🇪🇹', title:'Ethiopian Innovation', desc:'Proof that world-class technology can be built in Ethiopia, for Ethiopia.' },
      ],
    },
    testimonials: [
      { q:'This platform helped me organize my business and save hours every week. I can now see exactly what I have and what I earned.', name:'Tigist Bekele', role:'Textile Shop Owner, Merkato' },
      { q:'I never thought I could use technology for my business. HAGERE VOICE speaks my language. It changed everything.', name:'Almaz Girma', role:'Handcraft Artisan, Lalibela' },
      { q:'Now I can send my inventory report to my microfinance officer in seconds. This helped me get a business loan.', name:'Hiwot Tadesse', role:'Clothing Retailer, Dire Dawa' },
    ],
    cta: {
      h2: 'Empowering Women. Strengthening Businesses. Transforming Communities.',
      desc: 'Join a future where every Ethiopian woman entrepreneur can confidently manage her business using simple, accessible technology.',
      btn1: '🚀 Get Started Free', btn2: '▶ Watch Demo',
    },
    contactInfo: {
      title: 'Contact Us',
      email: 'Samrawitabebaw680@gmail.com',
      telegram: '@SamrawitAbebaw',
      location: 'Gondar, Ethiopia',
    },
    legal: {
      privacyTitle: 'Privacy Policy',
      termsTitle: 'Terms of Service',
      privacy: [
        'HAGERE VOICE collects only the information needed to run your shop account: phone number, shop name, inventory data, and voice command history.',
        'Your data is stored securely on Supabase with row-level security. Only you can access your shop data unless you share reports yourself.',
        'We do not sell personal data to third parties.',
        'You may request account deletion by contacting our support team.',
        'We may update this policy as the platform evolves. Continued use means you accept the updated policy.',
      ],
      terms: [
        'By using HAGERE VOICE you agree to use the platform for lawful business management purposes only.',
        'You are responsible for keeping your PIN/password secure and for the accuracy of inventory and sales you record.',
        'The platform is provided "as is" during early access. We strive for reliability but cannot guarantee uninterrupted service.',
        'Voice recognition and automated parsing may occasionally misinterpret commands — always verify important records.',
        'We may suspend accounts that abuse the service or attempt unauthorized access.',
      ],
    },
    footer: {
      tagline: 'Voice-powered business management for Ethiopian women entrepreneurs.',
      links: [
        { key: 'services', label: 'Services' },
        { key: 'contact',  label: 'Contact' },
        { key: 'privacy',  label: 'Privacy Policy' },
        { key: 'terms',    label: 'Terms' },
      ],
      copy: '© 2026 HAGERE VOICE. Built with ❤️ for Ethiopian Women Entrepreneurs.',
    },
  },
  am: {
    nav: { home:'ዋና', problem:'ችግር', solution:'መፍትሔ', features:'ባህሪያት', impact:'ተጽዕኖ', demo:'ማሳያ', contact:'ያግኙን', login:'ግባ', start:'ጀምር' },
    hero: {
      badge: '🇪🇹 በኢትዮጵያ የተሰራ • ለኢትዮጵያ ሴቶች',
      h1: 'ኢትዮጵያዊ ሴቶችን በዘመናዊ ቢዝነስ አስተዳደር ማብቃት',
      h2: 'ድምጽዎ። ጽሑፍዎ። የሱቅ ኃይልዎ።',
      desc: 'ምርቶችን፣ ቆጠባን፣ ሽያጮችን እና ሪፖርቶችን በድምጽ ወይም በቀላል ጽሑፍ ያስተዳድሩ። ቴክኖሎጂ ቀላል፣ ተደራሽ እና ኃይለኛ እንዲሆን ለሚፈልጉ ኢትዮጵያዊ ሴት ሥራ ፈጣሪዎች የተሰራ።',
      cta1: '🚀 መድረኩን ሞክሩ', cta2: '▶ ቪዲዮ ይመልከቱ',
    },
    stats: ['2 ሚሊዮን+\nሴት ሥራ ፈጣሪዎች','100%\nአማርኛ ድጋፍ','ድምጽ + ጽሑፍ\nተለዋዋጭ ግብዓት','24/7\nቢዝነስ አስተዳደር'],
    problem: {
      badge: 'ፈተናው',
      h2: 'ሚሊዮን ሴት ሥራ ፈጣሪዎች አሁንም ቢዝነሳቸውን በእጅ ያስተዳድራሉ',
      items: [
        { icon:'📋', title:'የወረቀት መዛግብት ይጠፋሉ', desc:'ማስታወሻ ደብተሮች ሲጠፉ ወይም ሲበላሹ አስፈላጊ ዳታ ይጠፋል።' },
        { icon:'📦', title:'ቆጠባ ለመከታተል ይቸግራል', desc:'የእጅ ቆጠራ ስህተቶች፣ ዕቃ ማጣት እና ምቹ አጋጣሚ ማጣት ያስከትላል።' },
        { icon:'🧮', title:'የገቢ ስሌቶች ጊዜ ይወስዳሉ', desc:'ቴክኖሎጂ በሰከንዶች ሊሰራው የሚችለውን ሂሳብ ሰዓታት ይወስዳሉ።' },
        { icon:'💻', title:'ዲጂታል መሳሪያዎች ውስብስብ ናቸው', desc:'ነባር ሶፍትዌሮች አብዛኛዎቹ ሥራ ፈጣሪዎች የሌላቸው ቴክኒካዊ ክህሎት ይፈልጋሉ።' },
        { icon:'⏰', title:'ጊዜ በወረቀት ሥራ ይባክናል', desc:'ቢዝነሱን ለማሳደግ ሊውል የሚችለው ጊዜ።' },
      ],
      impact: 'ከ2 ሚሊዮን በላይ ኢትዮጵያዊ ሴት ሥራ ፈጣሪዎች የተሻሉ መሳሪያዎች ይገባቸዋል',
    },
    solution: {
      badge: 'መፍትሔው',
      h2: 'አንድ መድረክ። ብዙ የሥራ ዘዴዎች።',
      voice: { title:'🎤 የድምጽ ትዕዛዞች', ex:'"ሸጥኩ ሱሪ አምስት"', items:['✓ ሽያጩን ይመዘግባል','✓ ቆጠባን ያሻሽላል','✓ ገቢን ያሰላል','✓ ሪፖርት ያዘጋጃል'] },
      text:  { title:'⌨️ ጽሑፍ ግብዓት', ex:'"ሀምሳ አዲስ ቦርሳ ጨምር"', items:['✓ ወዲያው ዕቃ ያሻሽላል','✓ የቴክኖሎጂ ብቃት አያስፈልግም','✓ ቀላል አማርኛ ወይም እንግሊዝኛ','✓ ፈጣን ማረጋገጫ'] },
    },
    howit: {
      badge: 'እንዴት ይሰራል',
      h2: 'ቀላል። ፈጣን። ለሁሉም የተዘጋጀ።',
      steps: [
        { icon:'🎤', n:'01', title:'ተናገሩ ወይም ጻፉ', desc:'አማርኛ ድምጽዎን ይጠቀሙ ወይም ቀላል ትዕዛዝ ይጻፉ። ልዩ ስልጠና አያስፈልግም።' },
        { icon:'⚙️', n:'02', title:'ብልህ ሂደት', desc:'ሲስተሙ ቋንቋዎን ይረዳል እና ጥያቄዎን ወዲያው ያስኬዳል።' },
        { icon:'📊', n:'03', title:'ወዲያው ይዘምናል', desc:'ቆጠባ፣ ሽያጭ፣ ገቢ እና ሪፖርቶች በቀጥታ ይዘምናሉ።' },
      ],
    },
    features: {
      badge: 'ባህሪያት',
      h2: 'ቢዝነስ ለማስኬድ የሚያስፈልጉ ሁሉ',
      items: [
        { icon:'🎤', title:'የድምጽ ትዕዛዞች', desc:'ቢዝነስዎን ለማስተዳደር አማርኛ ተናገሩ።' },
        { icon:'⌨️', title:'ጽሑፍ ግብዓት', desc:'በማንኛውም ጊዜ ቀላል ትዕዛዞች ይጻፉ።' },
        { icon:'📦', title:'ቆጠባ አስተዳደር', desc:'ዕቃዎቻቸውን ለመከታተል።' },
        { icon:'💰', title:'የገቢ ክትትል', desc:'የዕለት ቀደም ገቢን በብር ይቆጣጠሩ።' },
        { icon:'📊', title:'ብልህ ሪፖርቶች', desc:'በአንድ ጠቅ ሪፖርቶችን ያዘጋጁ።' },
        { icon:'📶', title:'ያለ ኢንተርኔት ይሰራል', desc:'ያለ ኢንተርኔት ሙሉ ተግባር።' },
        { icon:'📱', title:'ለሞባይል ምቹ', desc:'ለስማርትፎን የተዘጋጀ።' },
        { icon:'📤', title:'WhatsApp ማካፈያ', desc:'ቆጠባ እና ሪፖርቶችን ይላኩ።' },
        { icon:'📄', title:'PDF ወደ ውጭ', desc:'ለባንክ እና አቅራቢዎች ሪፖርቶች።' },
        { icon:'🔒', title:'ደህንነቱ የተጠበቀ', desc:'ቀላል 4-ዲጂት PIN። ኢሜይል አያስፈልግም።' },
        { icon:'🌍', title:'አማርኛ ድጋፍ', desc:'ሙሉ የኢትዮጵያ ቋንቋ ድጋፍ።' },
        { icon:'⚡', title:'ፈጣን እና ቀላል', desc:'ለቴክ ያልሆኑ ተጠቃሚዎች ተዘጋጅቷል።' },
      ],
    },
    empowerment: {
      badge: 'እውነተኛ ተጽዕኖ',
      h2: 'ለሴቶች የተሰራ። ለዕድገት የተሰራ።',
      story: 'ሳምራዊት በጎንደር፣ ኢትዮጵያ የልብስ ቢዝነስ ትሰራለች። እንደ ሚሊዮኖች ኢትዮጵያዊ ሴት ሥራ ፈጣሪዎች፣ ሳምራዊት ሳምንት ሳምንት ሰዓታት ዝርዝሮችን ትጽፍ፣ ገቢ ታሰላ፣ ቆጠባዋን ለመከታተል ትሞክር ነበር።',
      before: { title:'HAGERE VOICE በፊት', items:['📓 የሚጠፉ ማስታወሻ ደብተሮች','🧮 ምሽት ምሽት የእጅ ስሌቶች','❌ ትርፍ ምን ያህል እንደሆነ አይታወቅም','📦 ያለ ማስጠንቀቂያ ዕቃ ማጣት','⏰ ሰዓታት በወረቀት ሥራ ይባክናሉ'] },
      after:  { title:'HAGERE VOICE ከዛ በኋላ', items:['🎤 የድምጽ ዝመናዎች በሰከንዶች','💰 ወቅታዊ ገቢ በብር','✅ ሁልጊዜ የቆጠባ ደረጃ ታውቃለች','📊 ሙያዊ ሪፖርቶች ወዲያው','⏰ ለደንበኞቿ ተጨማሪ ጊዜ'] },
      quote: '"ቴክኖሎጂ ለኔ መስራት አለበት፣ ኔ ለቴክኖሎጂ አይደለም። HAGERE VOICE ቋንቋዬን እና ቢዝነሴን ይረዳል።"',
      name: '— ሳምራዊት፣ የልብስ ቢዝነስ ባለቤት፣ ጎንደር',
    },
    demo: {
      badge: 'ማሳያ',
      h2: 'መድረኩን በሥራ ላይ ይመልከቱ',
      screens: ['ዳሽቦርድ','ቆጠባ አስተዳደር','ድምጽ ትዕዛዝ','ሽያጭ እና ገቢ','ሪፖርቶች','ትንታኔ'],
    },
    impact: {
      badge: 'ተጽዕኖ',
      h2: 'ዕድሎችን የሚፈጥር ቴክኖሎጂ',
      stats: [
        { n:'2M+', label:'ሊደረስባቸው የሚችሉ ሴት ሥራ ፈጣሪዎች' },
        { n:'100%', label:'አማርኛ ቋንቋ ድጋፍ' },
        { n:'ዜሮ', label:'ቴክኒካዊ ብቃት አያስፈልግም' },
        { n:'24/7', label:'ቢዝነስ አስተዳደር' },
      ],
    },
    why: {
      badge: 'ለምን ጠቃሚ ነው',
      h2: 'ከሶፍትዌር በላይ',
      desc: 'HAGERE VOICE ለሁሉም ኢትዮጵያዊ ሴት ሥራ ፈጣሪ ዲጂታል ማብቃትን ለማምጣት ዓላማ ነው።',
      items: [
        { icon:'👩‍💼', title:'የሴቶች ኢኮኖሚያዊ ማብቃት', desc:'ሴቶች ቢዝነሳቸውን ሃሎነት ሆነው ያስተዳድሩ ዘንድ መሳሪያ መስጠት።' },
        { icon:'💳', title:'የፋይናንስ ነፃነት', desc:'የተሻሉ ቢዝነስ መዛግብቶች ወደ ብድርና ማይክሮፋይናንስ ያመሩታሉ።' },
        { icon:'📱', title:'ዲጂታል ማካተት', desc:'ቴክኖሎጂ ለወደኋላ ላሉት ተደራሽ ማድረግ።' },
        { icon:'🏪', title:'የአነስተኛ ቢዝነስ ዕድገት', desc:'አካባቢያዊ ቢዝነሶች ዘመናዊ ኢኮኖሚ ውስጥ እንዲወዳደሩ መደገፍ።' },
        { icon:'🌱', title:'አካባቢያዊ ሥራ ፈጠራ', desc:'የኢትዮጵያ ኢኮኖሚ አጥንትን መደገፍ።' },
        { icon:'🇪🇹', title:'ኢትዮጵያዊ ፈጠራ', desc:'ዓለምአቀፍ ቴክኖሎጂ ኢትዮጵያ ውስጥ ለኢትዮጵያ ሊሰራ እንደሚችል ማረጋገጫ።' },
      ],
    },
    testimonials: [
      { q:'ይህ መድረክ ቢዝነሴን ለማደራጀትና ሳምንታዊ ሰዓቶችን ለመቆጠብ ረዳኝ። አሁን ምን እንዳለኝ እና ምን እንዳተርፍ በግልጽ አየዋለሁ።', name:'ትግስት በቀለ', role:'የጨርቃጨርቅ ሱቅ ባለቤት፣ መርካቶ' },
      { q:'ቴክኖሎጂ ለቢዝነሴ ሊያገለግለኝ ይችላል ብዬ አላሰብኩም ነበር። HAGERE VOICE ቋንቋዬን ይናገራል። ሁሉንም ነገር ቀይሮዋል።', name:'አልማዝ ግርማ', role:'የእጅ ጥበብ አርቲዛን፣ ላሊበላ' },
      { q:'አሁን የቆጠባ ሪፖርቴን ለማይክሮፋይናንስ ቢሮ በሰከንዶች መላክ እችላለሁ። ይህ ብድር እንዳገኝ ረዳኝ።', name:'ህይወት ታደሰ', role:'የልብስ ቸርቻሪ፣ ዲሬ ዳዋ' },
    ],
    cta: {
      h2: 'ሴቶችን ማብቃት። ቢዝነሶችን ማጠናከር። ማህበረሰቦችን መቀየር።',
      desc: 'እያንዳንዷ ኢትዮጵያዊ ሴት ሥራ ፈጣሪ ቢዝነሷን ቀላልና ተደራሽ ቴክኖሎጂ ተጠቅማ በሃሎነት ማስተዳደር የምትችልበት ወደፊት ይቀላቀሉ።',
      btn1: '🚀 ነፃ ጀምር', btn2: '▶ ቪዲዮ ይመልከቱ',
    },
    contactInfo: {
      title: 'ያግኙን',
      email: 'Samrawitabebaw680@gmail.com',
      telegram: '@SamrawitAbebaw',
      location: 'ጎንደር፣ ኢትዮጵያ',
    },
    legal: {
      privacyTitle: 'የግላዊነት ፖሊሲ',
      termsTitle: 'የአገልግሎት ውሎች',
      privacy: [
        'HAGERE VOICE የሱቅ መለያዎን ለማስኬድ የሚያስፈልገውን መረጃ만 ይሰበስባል፡ ስልክ ቁጥር፣ የሱቅ ስም፣ የቆጠባ ዳታ እና የድምጽ ትዕዛዝ ታሪክ።',
        'ዳታዎ በSupabase ላይ በደህንነት ይከማቻል። ሪፖርት ካልላኩ በስተቀር የሱቅ ዳታዎን ሌላ ሰው መድረስ አይችልም።',
        'የግል መረጃን ለሶስተኛ ወገን አንሸጥም።',
        'መለያዎን ለማጥፋት በድጋፍ ቡድናችን መጠየቅ ይችላሉ።',
        'መድረኩ ሲሻሻል ፖሊሲው ሊቀየር ይችላል። መጠቀም መቀጠል የተሻሻለውን ፖሊሲ መቀበል ማለት ነው።',
      ],
      terms: [
        'HAGERE VOICE በመጠቀም ለህጋዊ የቢዝነስ አስተዳደር ብቻ መድረኩን መጠቀም ይስማማሉ።',
        'PIN/የይለፍ ቃልዎን ለመጠበቅ እና የሚመዘግቡት ቆጠባና ሽያጭ ትክክለኛ መሆኑን ለማረጋገጥ ተጠያቂ ነዎት።',
        'መድረኩ በጥንቃቄ ምዝገባ ጊዜ "እንደሆነ" ይሰጣል። ለተቀባይነት እንሞክራለን ግን ያለማቋረጥ አገልግሎት ማረጋገጥ አንችልም።',
        'የድምጽ recognition እና parsing አንዳንድ ጊዜ ትዕዛዞችን ሊጠራጠር ይችላል — አስፈላጊ ምዝግብ ሁልጊዜ ያረጋግጡ።',
        'አገልግሎቱን የሚያሳሱ ወይም ያለ ፈቃድ የሚገቡ መለያዎችን ልንዘጋ ይችላል።',
      ],
    },
    footer: {
      tagline: 'ለኢትዮጵያዊ ሴት ሥራ ፈጣሪዎች በድምጽ የሚመራ ቢዝነስ አስተዳደር።',
      links: [
        { key: 'services', label: 'አገልግሎቶች' },
        { key: 'contact',  label: 'ያግኙን' },
        { key: 'privacy',  label: 'የግላዊነት ፖሊሲ' },
        { key: 'terms',    label: 'ውሎች' },
      ],
      copy: '© 2026 HAGERE VOICE. ለኢትዮጵያዊ ሴት ሥራ ፈጣሪዎች በ❤️ የተሰራ።',
    },
  },
};

// ── Config ────────────────────────────────────────────────────────────────────
const DEMO_VIDEO_SRC = '/videos/hagere-demo.mp4';

const SOCIAL_LINKS = [
  { id: 'instagram', href: 'https://instagram.com/samrawitabebaw_19',                    label: 'Instagram' },
  { id: 'github',    href: 'https://github.com/samri19-A',                               label: 'GitHub' },
  { id: 'telegram',  href: 'https://t.me/SamrawitAbebaw',                                label: 'Telegram' },
  { id: 'linkedin',  href: 'https://www.linkedin.com/in/samrawit-abebaw-9b5b523a5',      label: 'LinkedIn' },
];

// ── Social icons (SVG) ────────────────────────────────────────────────────────
function SocialIcon({ id }) {
  const props = { width: 18, height: 18, fill: 'currentColor', 'aria-hidden': true };
  switch (id) {
    case 'instagram':
      return (
        <svg viewBox="0 0 24 24" {...props}>
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      );
    case 'github':
      return (
        <svg viewBox="0 0 24 24" {...props}>
          <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
        </svg>
      );
    case 'telegram':
      return (
        <svg viewBox="0 0 24 24" {...props}>
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
      );
    case 'linkedin':
      return (
        <svg viewBox="0 0 24 24" {...props}>
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      );
    default:
      return null;
  }
}

// ── Video modal ───────────────────────────────────────────────────────────────
function VideoModal({ open, onClose, lang }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (!open) {
      videoRef.current?.pause();
      return undefined;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="lp-modal-backdrop" onClick={onClose} role="presentation">
      <div className="lp-video-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={lang === 'am' ? 'የዲሞ ቪዲዮ' : 'Demo video'}>
        <button type="button" className="lp-modal-close" onClick={onClose} aria-label="Close">✕</button>
        <div className="lp-video-frame">
          <video
            ref={videoRef}
            className="lp-video-player"
            controls
            playsInline
            preload="metadata"
            poster="/videos/demo-poster.jpg"
          >
            <source src={DEMO_VIDEO_SRC} type="video/mp4" />
            {lang === 'am'
              ? 'የእርስዎ browser ቪዲዮን አይደግፍም።'
              : 'Your browser does not support the video tag.'}
          </video>
        </div>
        <p className="lp-video-caption">
          {lang === 'am'
            ? '3 ደቂቃ የHAGERE VOICE መድረክ ማሳያ'
            : '3-minute HAGERE VOICE platform demo'}
        </p>
      </div>
    </div>
  );
}

// ── Legal modal ───────────────────────────────────────────────────────────────
function LegalModal({ type, lang, onClose }) {
  const c = CONTENT[lang].legal;
  const title = type === 'privacy' ? c.privacyTitle : c.termsTitle;
  const items = type === 'privacy' ? c.privacy : c.terms;

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  return (
    <div className="lp-modal-backdrop" onClick={onClose} role="presentation">
      <div className="lp-legal-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="lp-legal-title">
        <div className="lp-legal-header">
          <h2 id="lp-legal-title">{title}</h2>
          <button type="button" className="lp-modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="lp-legal-body">
          <ul>
            {items.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ── Counter animation hook ────────────────────────────────────────────────────
function useCounter(target, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    const isNum = !isNaN(parseInt(target));
    if (!isNum) { setCount(target); return; }
    const end = parseInt(target);
    const step = Math.ceil(end / (duration / 16));
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + step, end);
      setCount(current);
      if (current >= end) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [start, target, duration]);
  return count;
}

// ── Intersection observer hook ────────────────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

// ── Stat counter card ─────────────────────────────────────────────────────────
function StatCard({ stat, inView }) {
  // If value contains '/' (like 24/7), don't animate — display as-is
  const isStatic = stat.n.includes('/') || isNaN(parseInt(stat.n));
  const raw    = isStatic ? '' : stat.n.replace(/[^0-9]/g, '');
  const suffix = isStatic ? '' : stat.n.replace(/[0-9]/g, '');
  const count  = useCounter(raw || 0, 2000, inView);
  return (
    <div className="lp-stat-card">
      <div className="lp-stat-num">{isStatic ? stat.n : (raw ? `${count}${suffix}` : stat.n)}</div>
      <div className="lp-stat-label">{stat.label}</div>
    </div>
  );
}

// ── Main LandingPage ──────────────────────────────────────────────────────────
export function LandingPage({ onEnterApp, onEnterAdmin }) {
  const [lang, setLang] = useState('en');
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [demoIdx, setDemoIdx] = useState(0);
  const [videoOpen, setVideoOpen] = useState(false);
  const [legalModal, setLegalModal] = useState(null);
  const c = CONTENT[lang];

  const [impactRef, impactInView] = useInView();
  const [heroRef, heroInView] = useInView(0.1);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  const openDemoVideo = () => {
    setMenuOpen(false);
    setVideoOpen(true);
  };

  const handleFooterLink = (key) => {
    if (key === 'services') scrollTo('features');
    else if (key === 'contact') scrollTo('contact');
    else if (key === 'privacy' || key === 'terms') setLegalModal(key);
  };

  return (
    <div className="lp" lang={lang}>

      {/* ── NAV ── */}
      <nav className={`lp-nav ${scrolled ? 'lp-nav-scrolled' : ''}`}>
        <div className="lp-nav-inner">
          <div className="lp-logo" onClick={() => scrollTo('home')}>
            <span className="lp-logo-icon">🎤</span>
            <span className="lp-logo-text">HAGERE VOICE</span>
          </div>

          <div className={`lp-nav-links ${menuOpen ? 'open' : ''}`}>
            {['home','problem','solution','features','impact','demo','contact'].map(k => (
              <button key={k} className="lp-nav-link" onClick={() => scrollTo(k)}>{c.nav[k]}</button>
            ))}
          </div>

          <div className="lp-nav-actions">
            <div className="lp-lang-toggle">
              <button className={lang==='am'?'active':''} onClick={() => setLang('am')}>🇪🇹 አማ</button>
              <button className={lang==='en'?'active':''} onClick={() => setLang('en')}>🇬🇧 EN</button>
            </div>
            <button className="lp-btn-ghost lp-nav-login" onClick={onEnterApp}>{c.nav.login}</button>
            <button className="lp-btn-primary lp-nav-start" onClick={onEnterApp}>{c.nav.start}</button>
            <button type="button" className="lp-hamburger" onClick={() => setMenuOpen(v => !v)} aria-label="Menu" aria-expanded={menuOpen}>
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section id="home" className="lp-hero" ref={heroRef}>
        <div className="lp-hero-bg">
          <div className="lp-hero-circle c1" />
          <div className="lp-hero-circle c2" />
          <div className="lp-hero-circle c3" />
          <div className="lp-hero-pattern" />
        </div>
        <div className="lp-container lp-hero-inner">
          <div className={`lp-hero-left ${heroInView ? 'visible' : ''}`}>
            <div className="lp-badge">{c.hero.badge}</div>
            <h1 className="lp-hero-h1">{c.hero.h1}</h1>
            <p className="lp-hero-h2">{c.hero.h2}</p>
            <p className="lp-hero-desc">{c.hero.desc}</p>
            <div className="lp-hero-btns">
              <button className="lp-btn-hero-primary" onClick={onEnterApp}>{c.hero.cta1}</button>
              <button className="lp-btn-hero-ghost" onClick={openDemoVideo}>{c.hero.cta2}</button>
            </div>
            <div className="lp-hero-stats">
              {c.stats.map((s, i) => (
                <div key={i} className="lp-hero-stat">
                  {s.split('\n').map((l, j) => (
                    <span key={j} className={j===0?'lp-hero-stat-n':'lp-hero-stat-l'}>{l}</span>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className={`lp-hero-right ${heroInView ? 'visible' : ''}`}>
            <div className="lp-mockup">
              <div className="lp-mockup-phone">
                <div className="lp-mockup-screen">
                  <div className="lp-mock-header">
                    <span className="lp-mock-title">HAGERE VOICE 🎤</span>
                    <span className="lp-mock-badge lp-online">● Online</span>
                  </div>
                  <div className="lp-mock-stats-row">
                    <div className="lp-mock-stat-mini"><span>📦</span><b>24</b><small>{lang==='am'?'ዓይነቶች':'Items'}</small></div>
                    <div className="lp-mock-stat-mini"><span>💰</span><b>3,450</b><small>{lang==='am'?'ብር':'Birr'}</small></div>
                    <div className="lp-mock-stat-mini"><span>🛍️</span><b>12</b><small>{lang==='am'?'ሽያጭ':'Sales'}</small></div>
                  </div>
                  <div className="lp-mock-voice-btn">
                    <span className="lp-mic-pulse">🎤</span>
                    <span>{lang==='am'?'ድምጽ ተናገር':'Speak Command'}</span>
                  </div>
                  <div className="lp-mock-items">
                    {[
                      {e:'👗', n:lang==='am'?'ሱሪ':'Dress', q:12},
                      {e:'👕', n:lang==='am'?'ቀሚስ':'Shirt', q:8},
                      {e:'🧣', n:lang==='am'?'ሻማ':'Scarf', q:25},
                    ].map((it,i) => (
                      <div key={i} className="lp-mock-item">
                        <span>{it.e}</span>
                        <span>{it.n}</span>
                        <span className="lp-mock-qty">{it.q}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="lp-float-card lp-float-1">
                <div className="lp-float-icon">✅</div>
                <div><b>{lang==='am'?'ሽያጭ ተመዝግቧል':'Sale Recorded'}</b><br/><small>{lang==='am'?'ሱሪ ×5 — 750 ብር':'Dress ×5 — 750 Birr'}</small></div>
              </div>
              <div className="lp-float-card lp-float-2">
                <div className="lp-float-icon">📈</div>
                <div><b>{lang==='am'?'የዛሬ ገቢ':'Today\'s Revenue'}</b><br/><small>3,450 {lang==='am'?'ብር':'Birr'}</small></div>
              </div>
              <div className="lp-float-card lp-float-3">
                <div className="lp-float-icon">⚠️</div>
                <div><b>{lang==='am'?'ያነሰ ዕቃ':'Low Stock'}</b><br/><small>{lang==='am'?'ጫማ — 2 ብቻ':'Shoes — Only 2'}</small></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROBLEM ── */}
      <section id="problem" className="lp-section lp-problem">
        <div className="lp-container">
          <div className="lp-badge lp-badge-red">{c.problem.badge}</div>
          <h2 className="lp-section-h2">{c.problem.h2}</h2>
          <div className="lp-problem-grid">
            {c.problem.items.map((item, i) => (
              <div key={i} className="lp-problem-card">
                <span className="lp-problem-icon">{item.icon}</span>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="lp-impact-banner">
            <span className="lp-impact-text">{c.problem.impact}</span>
          </div>
        </div>
      </section>

      {/* ── SOLUTION ── */}
      <section id="solution" className="lp-section lp-solution">
        <div className="lp-container">
          <div className="lp-badge">{c.solution.badge}</div>
          <h2 className="lp-section-h2">{c.solution.h2}</h2>
          <div className="lp-solution-grid">
            {[c.solution.voice, c.solution.text].map((sol, i) => (
              <div key={i} className={`lp-sol-card ${i===0?'lp-sol-voice':'lp-sol-text'}`}>
                <h3>{sol.title}</h3>
                <div className="lp-sol-example">
                  <span className="lp-sol-quote">"</span>
                  <span>{sol.ex}</span>
                  <span className="lp-sol-quote">"</span>
                </div>
                <ul className="lp-sol-list">
                  {sol.items.map((item, j) => <li key={j}>{item}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="lp-section lp-howit">
        <div className="lp-container">
          <div className="lp-badge">{c.howit.badge}</div>
          <h2 className="lp-section-h2">{c.howit.h2}</h2>
          <div className="lp-steps">
            {c.howit.steps.map((step, i) => (
              <div key={i} className="lp-step">
                <div className="lp-step-num">{step.n}</div>
                <div className="lp-step-icon">{step.icon}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
                {i < c.howit.steps.length-1 && <div className="lp-step-arrow">→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="lp-section lp-features">
        <div className="lp-container">
          <div className="lp-badge">{c.features.badge}</div>
          <h2 className="lp-section-h2">{c.features.h2}</h2>
          <div className="lp-features-grid">
            {c.features.items.map((f, i) => (
              <div key={i} className="lp-feature-card">
                <span className="lp-feature-icon">{f.icon}</span>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EMPOWERMENT ── */}
      <section className="lp-section lp-empower">
        <div className="lp-container">
          <div className="lp-badge lp-badge-gold">{c.empowerment.badge}</div>
          <h2 className="lp-section-h2">{c.empowerment.h2}</h2>
          <p className="lp-empower-story">{c.empowerment.story}</p>

          {/* Real Ethiopian women artisan photos */}
          <div className="lp-artisan-photos">
            <div className="lp-artisan-photo-wrap">
              <img src="/women/pottery-workshop.jpg" alt="Ethiopian women making pottery" className="lp-artisan-photo" loading="lazy" onError={(e)=>{e.target.parentElement.style.display='none'}} />
              <div className="lp-artisan-label">{lang==='am'?'የሸክላ ሥራ':'Pottery Craft'}</div>
            </div>
            <div className="lp-artisan-photo-wrap lp-photo-featured">
              <img src="/women/cotton-spinner.jpg" alt="Ethiopian woman spinning cotton" className="lp-artisan-photo" loading="lazy" onError={(e)=>{e.target.parentElement.style.display='none'}} />
              <div className="lp-artisan-label">{lang==='am'?'የጨርቃጨርቅ ሥራ':'Textile Craft'}</div>
            </div>
            <div className="lp-artisan-photo-wrap">
              <img src="/women/textile-weaver.jpg" alt="Ethiopian woman weaving" className="lp-artisan-photo" loading="lazy" onError={(e)=>{e.target.parentElement.style.display='none'}} />
              <div className="lp-artisan-label">{lang==='am'?'የሽመና ሥራ':'Weaving'}</div>
            </div>
            <div className="lp-artisan-photo-wrap">
              <img src="/women/pottery-artisan.jpg" alt="Ethiopian woman artisan" className="lp-artisan-photo" loading="lazy" onError={(e)=>{e.target.parentElement.style.display='none'}} />
              <div className="lp-artisan-label">{lang==='am'?'ወጣት አርቲዛን':'Young Artisan'}</div>
            </div>
          </div>

          <div className="lp-before-after">
            <div className="lp-ba-card lp-ba-before">
              <h3>{c.empowerment.before.title}</h3>
              <ul>{c.empowerment.before.items.map((it,i) => <li key={i}>{it}</li>)}</ul>
            </div>
            <div className="lp-ba-arrow">→</div>
            <div className="lp-ba-card lp-ba-after">
              <h3>{c.empowerment.after.title}</h3>
              <ul>{c.empowerment.after.items.map((it,i) => <li key={i}>{it}</li>)}</ul>
            </div>
          </div>
          <blockquote className="lp-quote">
            <p>{c.empowerment.quote}</p>
            <cite>{c.empowerment.name}</cite>
          </blockquote>
        </div>
      </section>

      {/* ── DEMO ── */}
      <section id="demo" className="lp-section lp-demo">
        <div className="lp-container">
          <div className="lp-badge">{c.demo.badge}</div>
          <h2 className="lp-section-h2">{c.demo.h2}</h2>
          <div className="lp-demo-tabs">
            {c.demo.screens.map((s, i) => (
              <button key={i} className={`lp-demo-tab ${demoIdx===i?'active':''}`} onClick={() => setDemoIdx(i)}>{s}</button>
            ))}
          </div>
          <div className="lp-demo-screen">
            <div className="lp-demo-video-wrap">
              <video
                className="lp-demo-video"
                controls
                playsInline
                preload="metadata"
                poster="/videos/demo-poster.jpg"
              >
                <source src={DEMO_VIDEO_SRC} type="video/mp4" />
              </video>
            </div>
            <div className="lp-demo-actions">
              <button type="button" className="lp-demo-play-btn" onClick={openDemoVideo}>
                <span className="lp-demo-play-icon">▶</span>
                <span>{lang === 'am' ? '3 ደቂቃ ማሳያ በሙሉ ማያ መልከት' : 'Watch 3-min Demo Fullscreen'}</span>
              </button>
              <p className="lp-demo-video-note">
                {lang === 'am'
                  ? 'የእርስዎን ቪዲዮ በ public/videos/hagere-demo.mp4 ውስጥ ይጨምሩ'
                  : 'Add your video file at public/videos/hagere-demo.mp4'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── IMPACT ── */}
      <section id="impact" className="lp-section lp-impact" ref={impactRef}>
        <div className="lp-container">
          <div className="lp-badge lp-badge-white">{c.impact.badge}</div>
          <h2 className="lp-section-h2 lp-white">{c.impact.h2}</h2>
          <div className="lp-impact-stats">
            {c.impact.stats.map((s, i) => <StatCard key={i} stat={s} inView={impactInView} />)}
          </div>
        </div>
      </section>

      {/* ── WHY ── */}
      <section className="lp-section lp-why">
        <div className="lp-container">
          <div className="lp-badge">{c.why.badge}</div>
          <h2 className="lp-section-h2">{c.why.h2}</h2>
          <p className="lp-why-desc">{c.why.desc}</p>
          <div className="lp-why-grid">
            {c.why.items.map((item, i) => (
              <div key={i} className="lp-why-card">
                <span className="lp-why-icon">{item.icon}</span>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="lp-section lp-testimonials">
        <div className="lp-container">
          <h2 className="lp-section-h2">{lang==='am'?'ተጠቃሚዎች ምን ይላሉ':'What Users Are Saying'}</h2>
          <div className="lp-testi-grid">
            {c.testimonials.map((t, i) => (
              <div key={i} className="lp-testi-card">
                <div className="lp-testi-stars">★★★★★</div>
                <p className="lp-testi-q">"{t.q}"</p>
                <div className="lp-testi-author">
                  <div className="lp-testi-avatar">{t.name[0]}</div>
                  <div>
                    <strong>{t.name}</strong>
                    <small>{t.role}</small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section id="contact" className="lp-cta">
        <div className="lp-cta-bg" />
        <div className="lp-container lp-cta-inner">
          <h2 className="lp-cta-h2">{c.cta.h2}</h2>
          <p className="lp-cta-desc">{c.cta.desc}</p>
          <div className="lp-cta-btns">
            <button className="lp-btn-cta-primary" onClick={onEnterApp}>{c.cta.btn1}</button>
            <button className="lp-btn-cta-ghost" onClick={openDemoVideo}>{c.cta.btn2}</button>
          </div>
          <div className="lp-contact-cards">
            <div className="lp-contact-card">
              <span>📧</span>
              <div>
                <strong>{c.contactInfo.title}</strong>
                <a href={`mailto:${c.contactInfo.email}`}>{c.contactInfo.email}</a>
              </div>
            </div>
            <div className="lp-contact-card">
              <span>✈️</span>
              <div>
                <strong>Telegram</strong>
                <a href="https://t.me/SamrawitAbebaw" target="_blank" rel="noopener noreferrer">{c.contactInfo.telegram}</a>
              </div>
            </div>
            <div className="lp-contact-card">
              <span>📍</span>
              <div>
                <strong>{lang === 'am' ? 'አድራሻ' : 'Location'}</strong>
                <span>{c.contactInfo.location}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="lp-footer">
        <div className="lp-container">
          <div className="lp-footer-top">
            <div className="lp-footer-brand">
              <div className="lp-logo">
                <span className="lp-logo-icon">🎤</span>
                <span className="lp-logo-text">HAGERE VOICE</span>
              </div>
              <p className="lp-footer-tagline">{c.footer.tagline}</p>
              <div className="lp-social">
                {SOCIAL_LINKS.map(({ id, href, label }) => (
                  <a
                    key={id}
                    href={href}
                    className="lp-social-btn"
                    aria-label={label}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <SocialIcon id={id} />
                  </a>
                ))}
              </div>
            </div>
            <nav className="lp-footer-links" aria-label="Footer">
              {c.footer.links.map(({ key, label }) => (
                <button key={key} type="button" className="lp-footer-link" onClick={() => handleFooterLink(key)}>
                  {label}
                </button>
              ))}
            </nav>
          </div>
          <div className="lp-footer-bottom">
            <p>{c.footer.copy}</p>
          </div>
        </div>
      </footer>

      {videoOpen && <VideoModal open={videoOpen} onClose={() => setVideoOpen(false)} lang={lang} />}
      {legalModal && <LegalModal type={legalModal} lang={lang} onClose={() => setLegalModal(null)} />}
    </div>
  );
}
