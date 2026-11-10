const fs = require('fs');

// We have media_1793467000480_dcb7d54f.jpg
// Let's see what image it is!
// Is the background image hero_poster.jpg?
// Let's check if the video has hero_poster.jpg as poster or if the video contains this exact scene
console.log('Comparing user image with hero_poster.jpg');
const userImg = fs.readFileSync('C:/Users/DANIBOYXK/.gemini/antigravity/brain/88bd2602-c8fd-4415-90f3-ff7c89614d52/.user_uploaded/media_1793467000480_dcb7d54f.jpg');
const poster = fs.readFileSync('C:/EXOTICS/public/assets/hero_poster.jpg');

// Let's check if hero_poster is the exact background
console.log('userImg length:', userImg.length, 'poster length:', poster.length);

