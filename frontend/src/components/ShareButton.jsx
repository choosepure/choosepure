import React, { useState } from 'react';
import { Share2, X, Facebook, Twitter, Linkedin, Link2, MessageCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { toast } from '../hooks/use-toast';

const ShareButton = ({ 
  url = window.location.href, 
  title = 'ChoosePure - Food Safety Testing',
  description = 'Join India\'s first parent-led community that tests food for purity',
  size = 'default',
  variant = 'outline'
}) => {
  const [showShareMenu, setShowShareMenu] = useState(false);

  const shareUrl = encodeURIComponent(url);
  const shareTitle = encodeURIComponent(title);
  const shareDescription = encodeURIComponent(description);

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: description,
          url: url,
        });
        toast({
          title: 'Shared!',
          description: 'Thank you for spreading the word!',
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    } else {
      setShowShareMenu(true);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    toast({
      title: 'Link Copied!',
      description: 'Share link has been copied to clipboard',
    });
    setShowShareMenu(false);
  };

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
    whatsapp: `https://wa.me/?text=${shareTitle}%20${shareUrl}`,
  };

  const handleSocialShare = (platform) => {
    window.open(shareLinks[platform], '_blank', 'width=600,height=400');
    setShowShareMenu(false);
  };

  return (
    <div className="relative">
      <Button
        variant={variant}
        size={size}
        onClick={handleNativeShare}
        className="gap-2"
      >
        <Share2 size={18} />
        Share
      </Button>

      {showShareMenu && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setShowShareMenu(false)}
          />
          
          {/* Share Menu */}
          <Card className="absolute right-0 mt-2 p-4 w-64 shadow-lg z-50 border-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-900">Share via</h3>
              <button
                onClick={() => setShowShareMenu(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2">
              {/* WhatsApp */}
              <button
                onClick={() => handleSocialShare('whatsapp')}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-green-50 transition-colors text-left"
              >
                <MessageCircle size={20} className="text-green-600" />
                <span className="text-gray-700">WhatsApp</span>
              </button>

              {/* Facebook */}
              <button
                onClick={() => handleSocialShare('facebook')}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors text-left"
              >
                <Facebook size={20} className="text-blue-600" />
                <span className="text-gray-700">Facebook</span>
              </button>

              {/* Twitter */}
              <button
                onClick={() => handleSocialShare('twitter')}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-sky-50 transition-colors text-left"
              >
                <Twitter size={20} className="text-sky-600" />
                <span className="text-gray-700">Twitter</span>
              </button>

              {/* LinkedIn */}
              <button
                onClick={() => handleSocialShare('linkedin')}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors text-left"
              >
                <Linkedin size={20} className="text-blue-700" />
                <span className="text-gray-700">LinkedIn</span>
              </button>

              {/* Copy Link */}
              <button
                onClick={copyToClipboard}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors text-left border-t mt-2 pt-3"
              >
                <Link2 size={20} className="text-gray-600" />
                <span className="text-gray-700">Copy Link</span>
              </button>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default ShareButton;
