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
      story: 'Samrawit runs a clothing business in Addis Ababa. Like millions of Ethiopian women entrepreneurs, she spent hours every week writing records, calculating revenue, and trying to keep track of her inventory.',
      before: { title:'Before HAGERE VOICE', items:['📓 Paper notebooks that get lost','🧮 Manual calculations every evening','❌ No clear picture of profits','📦 Stockouts without warning','⏰ Hours wasted on paperwork'] },
      after:  { title:'After HAGERE VOICE', items:['🎤 Voice updates in seconds','💰 Real-time revenue in Birr','✅ Always knows her stock levels','📊 Professional reports instantly','⏰ More time for her customers'] },
      quote: '"Technology should work for me, not against me. HAGERE VOICE understands my language and my business."',
      name: '— Mastewal, Clothing Business Owner, Addis Ababa',
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
    footer: {
      tagline: 'Voice-powered business management for Ethiopian women entrepreneurs.',
      links: ['About Project','Contact','Privacy Policy','Terms','Competition Info'],
      copy: '© 2025 HAGERE VOICE. Built with ❤️ for Ethiopian Women Entrepreneurs.',
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
      story: 'ሳምራዊት በአዲስ አበባ የልብስ ቢዝነስ ትሰራለች። እንደ ሚሊዮኖች ኢትዮጵያዊ ሴት ሥራ ፈጣሪዎች፣ ሳምራዊት ሳምንት ሳምንት ሰዓታት ዝርዝሮችን ትጽፍ፣ ገቢ ታሰላ፣ ቆጠባዋን ለመከታተል ትሞክር ነበር።',
      before: { title:'HAGERE VOICE በፊት', items:['📓 የሚጠፉ ማስታወሻ ደብተሮች','🧮 ምሽት ምሽት የእጅ ስሌቶች','❌ ትርፍ ምን ያህል እንደሆነ አይታወቅም','📦 ያለ ማስጠንቀቂያ ዕቃ ማጣት','⏰ ሰዓታት በወረቀት ሥራ ይባክናሉ'] },
      after:  { title:'HAGERE VOICE ከዛ በኋላ', items:['🎤 የድምጽ ዝመናዎች በሰከንዶች','💰 ወቅታዊ ገቢ በብር','✅ ሁልጊዜ የቆጠባ ደረጃ ታውቃለች','📊 ሙያዊ ሪፖርቶች ወዲያው','⏰ ለደንበኞቿ ተጨማሪ ጊዜ'] },
      quote: '"ቴክኖሎጂ ለኔ መስራት አለበት፣ ኔ ለቴክኖሎጂ አይደለም። HAGERE VOICE ቋንቋዬን እና ቢዝነሴን ይረዳል።"',
      name: '— ሳምራዊት፣ የልብስ ቢዝነስ ባለቤት፣ አዲስ አበባ',
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
    footer: {
      tagline: 'ለኢትዮጵያዊ ሴት ሥራ ፈጣሪዎች በድምጽ የሚመራ ቢዝነስ አስተዳደር።',
      links: ['ስለ ፕሮጀክቱ','ያግኙን','የግላዊነት ፖሊሲ','ውሎች','የውድድር መረጃ'],
      copy: '© 2026 HAGERE VOICE. ለኢትዮጵያዊ ሴት ሥራ ፈጣሪዎች በ❤️ የተሰራ።',
    },
  },
};

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
  const raw = stat.n.replace(/[^0-9]/g, '');
  const suffix = stat.n.replace(/[0-9]/g, '');
  const count = useCounter(raw || 0, 2000, inView);
  return (
    <div className="lp-stat-card">
      <div className="lp-stat-num">{raw ? `${count}${suffix}` : stat.n}</div>
      <div className="lp-stat-label">{stat.label}</div>
    </div>
  );
}

// ── Main LandingPage ──────────────────────────────────────────────────────────
export function LandingPage({ onEnterApp }) {
  const [lang, setLang] = useState('en');
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [demoIdx, setDemoIdx] = useState(0);
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
              <button className={lang==='am'?'active':''} onClick={() => setLang('am')}>🇪🇹 አማርኛ</button>
              <button className={lang==='en'?'active':''} onClick={() => setLang('en')}>🇬🇧 English</button>
            </div>
            <button className="lp-btn-ghost" onClick={onEnterApp}>{c.nav.login}</button>
            <button className="lp-btn-primary" onClick={onEnterApp}>{c.nav.start}</button>
            <button className="lp-hamburger" onClick={() => setMenuOpen(v => !v)} aria-label="Menu">
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
              <button className="lp-btn-hero-ghost" onClick={() => scrollTo('demo')}>{c.hero.cta2}</button>
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
            <div className="lp-demo-placeholder">
              <span className="lp-demo-ph-icon">📱</span>
              <p className="lp-demo-ph-title">{c.demo.screens[demoIdx]}</p>
              <p className="lp-demo-ph-sub">{lang==='am'?'ቅጂ ምስሎች ቶሎ ይመጣሉ':'Screenshot coming soon'}</p>
              <button className="lp-btn-primary" onClick={onEnterApp}>{lang==='am'?'አሁን ሞክሩ':'Try It Now'}</button>
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
            <button className="lp-btn-cta-ghost" onClick={() => scrollTo('demo')}>{c.cta.btn2}</button>
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
                {['Telegram','Facebook','Instagram','LinkedIn'].map(s => (
                  <a key={s} href="#" className="lp-social-btn" aria-label={s}>
                    {s==='Telegram'?'✈️':s==='Facebook'?'📘':s==='Instagram'?'📷':'💼'}
                  </a>
                ))}
              </div>
            </div>
            <div className="lp-footer-links">
              {c.footer.links.map((l,i) => <a key={i} href="#" className="lp-footer-link">{l}</a>)}
            </div>
          </div>
          <div className="lp-footer-bottom">
            <p>{c.footer.copy}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
