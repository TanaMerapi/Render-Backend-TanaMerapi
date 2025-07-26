import SocialMedia from '../models/SocialMediaModel.js';

// Get all social media links
export const getSocialMediaLinks = async (req, res) => {
  try {
    const socialMediaLinks = await SocialMedia.findAll();
    res.json(socialMediaLinks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new social media link
export const createSocialMediaLink = async (req, res) => {
  try {
    const { platform, url, icon } = req.body;
    
    // Check if platform already exists
    const existing = await SocialMedia.findOne({ where: { platform } });
    if (existing) {
      return res.status(400).json({ message: `${platform} link already exists` });
    }
    
    const socialMediaLink = await SocialMedia.create({
      platform,
      url,
      icon
    });
    
    res.status(201).json(socialMediaLink);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a social media link
export const updateSocialMediaLink = async (req, res) => {
  try {
    const { id } = req.params;
    const { platform, url, icon } = req.body;
    
    const socialMediaLink = await SocialMedia.findByPk(id);
    if (!socialMediaLink) {
      return res.status(404).json({ message: 'Social media link not found' });
    }
    
    // If platform is being changed, check for existing link with that platform
    if (platform && platform !== socialMediaLink.platform) {
      const existing = await SocialMedia.findOne({ where: { platform } });
      if (existing) {
        return res.status(400).json({ message: `${platform} link already exists` });
      }
    }
    
    // Update social media link
    await socialMediaLink.update({
      platform: platform || socialMediaLink.platform,
      url: url || socialMediaLink.url,
      icon: icon || socialMediaLink.icon
    });
    
    res.json(socialMediaLink);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a social media link
export const deleteSocialMediaLink = async (req, res) => {
  try {
    const { id } = req.params;
    
    const socialMediaLink = await SocialMedia.findByPk(id);
    if (!socialMediaLink) {
      return res.status(404).json({ message: 'Social media link not found' });
    }
    
    // Delete social media link from database
    await socialMediaLink.destroy();
    
    res.json({ message: 'Social media link deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};