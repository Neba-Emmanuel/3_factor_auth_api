const svgCaptcha = require('svg-captcha');

// Generate a CAPTCHA image
const generateCaptcha = () => {
  const captcha = svgCaptcha.create();
  return {
    text: captcha.text,
    data: captcha.data,
  };
};

module.exports = generateCaptcha;
