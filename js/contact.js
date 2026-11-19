// Central place for personal info and contact links.
// Fill in the empty strings below — leave a field blank to hide that option.
// Do not invent values; only paste real links/numbers you own.

export const CONTACT = {
  name: 'Abdelrahman Hassan',
  role: 'Communication and Computer Engineer',
  intro:
    'I am a Communication and Computer Engineer passionate about Game Development, Game Art, 3D Design, and interactive experiences. I work on creating games, digital environments, and VR experiences.',

  // Examples: 'https://www.linkedin.com/in/your-handle'
  linkedin: '',

  // International format preferred, e.g. '+201234567890'
  phone: '',

  // Digits only for WhatsApp, e.g. '201234567890' → https://wa.me/201234567890
  whatsapp: '',

  // e.g. 'you@example.com'
  email: '',

  // Confirmed from your GitHub profile.
  github: 'https://github.com/AbduulrahmanHassan',

  // Behance or ArtStation URL
  portfolio: '',

  // Path to a PDF in this project, e.g. 'assets/Abdelrahman-Hassan-CV.pdf'
  // Put the file in the repo, then set this path.
  cv: '',

  // Label used on the CV button when a path is set
  cvLabel: 'Download CV'
};

export function contactLinks() {
  const links = [];

  if (CONTACT.linkedin) {
    links.push({
      id: 'linkedin',
      label: 'LinkedIn',
      href: CONTACT.linkedin,
      external: true,
      icon: 'in'
    });
  }
  if (CONTACT.phone) {
    links.push({
      id: 'phone',
      label: CONTACT.phone,
      href: 'tel:' + CONTACT.phone.replace(/\s+/g, ''),
      external: false,
      icon: 'phone'
    });
  }
  if (CONTACT.whatsapp) {
    const digits = String(CONTACT.whatsapp).replace(/\D/g, '');
    links.push({
      id: 'whatsapp',
      label: 'WhatsApp',
      href: 'https://wa.me/' + digits,
      external: true,
      icon: 'wa'
    });
  }
  if (CONTACT.email) {
    links.push({
      id: 'email',
      label: CONTACT.email,
      href: 'mailto:' + CONTACT.email,
      external: false,
      icon: 'mail'
    });
  }
  if (CONTACT.github) {
    links.push({
      id: 'github',
      label: 'GitHub',
      href: CONTACT.github,
      external: true,
      icon: 'gh'
    });
  }
  if (CONTACT.portfolio) {
    links.push({
      id: 'portfolio',
      label: 'Behance / ArtStation',
      href: CONTACT.portfolio,
      external: true,
      icon: 'art'
    });
  }
  if (CONTACT.cv) {
    links.push({
      id: 'cv',
      label: CONTACT.cvLabel || 'Download CV',
      href: CONTACT.cv,
      external: false,
      download: true,
      icon: 'cv'
    });
  }

  return links;
}
