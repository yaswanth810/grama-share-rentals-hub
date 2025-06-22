
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RefreshCw } from 'lucide-react';

interface CaptchaProps {
  onVerify: (isValid: boolean) => void;
  isValid: boolean;
}

const Captcha: React.FC<CaptchaProps> = ({ onVerify, isValid }) => {
  const [captchaText, setCaptchaText] = useState('');
  const [userInput, setUserInput] = useState('');

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(result);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  useEffect(() => {
    const isValidCaptcha = userInput.toLowerCase() === captchaText.toLowerCase() && userInput.length > 0;
    onVerify(isValidCaptcha);
  }, [userInput, captchaText, onVerify]);

  const handleRefresh = () => {
    generateCaptcha();
    setUserInput('');
  };

  return (
    <div className="space-y-2">
      <Label>Captcha Verification</Label>
      <div className="flex items-center space-x-2">
        <div 
          className="flex-1 bg-gray-100 border border-gray-300 px-4 py-2 rounded font-mono text-lg tracking-widest text-center select-none"
          style={{
            background: 'linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)',
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
          }}
        >
          {captchaText}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleRefresh}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      <Input
        type="text"
        placeholder="Enter the text above"
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        className={isValid ? 'border-green-500' : userInput.length > 0 ? 'border-red-500' : ''}
      />
      {userInput.length > 0 && !isValid && (
        <p className="text-sm text-red-600">Captcha does not match. Please try again.</p>
      )}
    </div>
  );
};

export default Captcha;
