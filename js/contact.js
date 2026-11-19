// Central place for personal info and contact links.
// Fill any empty strings below. Blank fields show as “add me” rows in the hub.
// LinkedIn + Behance matched your public XR / El Shorouk profile.
// Phone, WhatsApp, email, and CV were not public — paste your real ones here.

export const CONTACT = {
  name: 'Abdelrahman Hassan',
  role: 'Communication and Computer Engineer · XR Developer',
  intro:
    'I am a Communication and Computer Engineer passionate about Game Development, Game Art, 3D Design, and interactive experiences. I work on creating games, digital environments, and VR experiences.',

  linkedin: 'https://www.linkedin.com/in/abdelrahman-hassan-23a932249',

  // e.g. '+2010xxxxxxxx'
  phone: '+201553396553',

  // Digits only with country code for wa.me
  whatsapp: '201553396553',

  // e.g. 'you@gmail.com'
  email: 'abdalrahmanhassan13@gmail.com',

  github: 'https://github.com/AbduulrahmanHassan',

  portfolio: 'https://www.behance.net/Abduulrahman',

  // e.g. 'assets/Abdelrahman-Hassan-CV.pdf'
  cv: '',
  cvLabel: 'Download CV'
};

export function contactLinks() {
  const links = [
    {
      id: 'linkedin',
      label: 'LinkedIn',
      href: CONTACT.linkedin,
      external: true,
      icon: 'in',
      missing: !CONTACT.linkedin
    },
    {
      id: 'phone',
      label: CONTACT.phone || 'Add phone in js/contact.js',
      href: CONTACT.phone ? 'tel:' + CONTACT.phone.replace(/\s+/g, '') : '',
      external: false,
      icon: 'phone',
      missing: !CONTACT.phone
    },
    {
      id: 'whatsapp',
      label: CONTACT.whatsapp ? 'WhatsApp' : 'Add WhatsApp in js/contact.js',
      href: CONTACT.whatsapp ? 'https://wa.me/' + String(CONTACT.whatsapp).replace(/\D/g, '') : '',
      external: true,
      icon: 'wa',
      missing: !CONTACT.whatsapp
    },
    {
      id: 'email',
      label: CONTACT.email || 'Add Gmail in js/contact.js',
      href: CONTACT.email ? 'mailto:' + CONTACT.email : '',
      external: false,
      icon: 'mail',
      missing: !CONTACT.email
    },
    {
      id: 'github',
      label: 'GitHub',
      href: CONTACT.github,
      external: true,
      icon: 'gh',
      missing: !CONTACT.github
    },
    {
      id: 'portfolio',
      label: 'Behance',
      href: CONTACT.portfolio,
      external: true,
      icon: 'art',
      missing: !CONTACT.portfolio
    },
    {
      id: 'cv',
      label: CONTACT.cv ? (CONTACT.cvLabel || 'Download CV') : 'Add CV path in js/contact.js',
      href: CONTACT.cv || '',
      external: false,
      download: !!CONTACT.cv,
      icon: 'cv',
      missing: !CONTACT.cv
    }
  ];

  return links;
}
