
import React from 'react';
import { FacebookIcon, InstagramIcon, LinkedinIcon, TelegramIcon, TwitterIcon, YoutubeIcon } from './icons';

const socialLinks = [
  { name: 'Facebook', icon: FacebookIcon, url: '#' },
  { name: 'Instagram', icon: InstagramIcon, url: '#' },
  { name: 'Linkedin', icon: LinkedinIcon, url: '#' },
  { name: 'Telegram', icon: TelegramIcon, url: '#' },
  { name: 'Youtube', icon: YoutubeIcon, url: '#' },
  { name: 'Twitter', icon: TwitterIcon, url: '#' },
];

const Footer: React.FC = () => {
  return (
    <footer className="bg-zamzam-teal-800 text-white mt-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center">
          <div className="flex space-x-6 mb-6">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Zamzam Bank on ${social.name}`}
                className="text-zamzam-teal-100 hover:text-white transition-colors duration-300"
              >
                <social.icon className="h-6 w-6" />
              </a>
            ))}
          </div>
          <p className="text-sm text-zamzam-teal-200">
            Copyright © 2025 ZamZam Bank. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;