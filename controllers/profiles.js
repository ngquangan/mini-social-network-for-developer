//Load profile Model
import Profile from '@local_models/profile';

//Load validate
import ValidateProfileInput from '@local_validations/profile';
import ValidateExperienceInput from '@local_validations/experience';
import ValidateEducationInput from '@local_validations/education';


const getCurrentProfile = async (req, res, next) => {
    
    const errors = {};

    let profile = null;

    try {
        profile = await Profile.findOne({user: req.user.id})
        .populate('user', 'name avatar');
    } catch (error) {
        return res.status(500).json(error);
    }
    
    if(!profile) {
        errors.noprofile = 'There is no profile for this user';
        return res.status(404).json(errors);
    }
    return res.status(200).json(profile);
    
}

const getAllProfiles = async (req, res, next) => {
    let errors = {};
    let profiles = [];

    try {
        profiles = await Profile.find().populate('user', 'name avatar');
    } catch (error) {
        return res.status(500).json(error);
    }

    if(!profiles.length > 0) {
        errors.noprofile = "There are no profiles";
        return res.status(404).json(errors);
    }
    return res.status(200).json({profiles});


}

const getProfileByUserID = async (req, res, next) => {
    const errors = {};
    let profile = null;

    try {
        profile = await Profile.findOne({user: req.params.user_id})
        .populate('user', 'name avatar');
    } catch (error) {
        return res.status(500).json(error);
    }

    if(!profile) {
        errors.noprofile = "There is no profile for this user";
        return res.status(404).json(errors);
    }

    return res.status(200).json(profile);

}

const getProfileByHandle = async (req, res, next) => {
    const errors = {};
    let profile = null;

    try {
        profile = await Profile.findOne({handle: req.params.handle})
        .populate('user', 'name avatar');
    } catch (error) {
        return res.status(500).json(error);
    }

    if(!profile) {
        errors.noprofile = "There is no profile for this user";
        return res.status(404).json(errors);
    }

    return res.status(200).json(profile);

}

const createAndEditProfile = async (req, res, next) => {
    
    const {errors, isValid} = ValidateProfileInput(req.body);

    if(!isValid) {
        return res.status(400).json(errors);
    }

    // Get fields
    const profileFields = {}

    profileFields.user = req.user.id;

    if(req.body.handle) {
        profileFields.handle = req.body.handle;
    }

    if(req.body.company) {
        profileFields.company = req.body.company;
    }

    if(req.body.website) {
        profileFields.website = req.body.website;
    }

    if(req.body.location) {
        profileFields.location = req.body.location;
    }

    if(req.body.status) {
        profileFields.status = req.body.status;
    }

    if(req.body.bio) {
        profileFields.bio = req.body.bio;
    }
    
    if(req.body.githubusername) {
        profileFields.githubusername = req.body.githubusername;
    }

    //Skills 
    if(typeof req.body.skills !== 'undefined' || typeof req.body.skills !== 'null') {
        profileFields.skills = req.body.skills.split(',');
    }

    //Social
    profileFields.social = {};
    if(req.body.youtube) {
        profileFields.social.youtube = req.body.youtube;
    }
    if(req.body.twitter) {
        profileFields.social.twitter = req.body.twitter;
    }
    if(req.body.facebook) {
        profileFields.social.facebook = req.body.facebook;
    }
    if(req.body.linkedin) {
        profileFields.social.linkedin = req.body.linkedin;
    }  
    if(req.body.instagram) {
        profileFields.social.instagram = req.body.instagram;
    }  

    let profile = null;

    try {
        profile = await Profile.findOne({user: req.user.id})
    } catch (error) {
        return res.status(500).json(error);
    }

    if(profile) {
        //Update
        let updatedProfile = null;

        try {
            updatedProfile = await Profile.findOneAndUpdate({user: req.user.id}, {$set: profileFields}, {new: true});
        } catch (error) {
            return res.status(500).json(error);
        }

        if(updatedProfile) {
            return res.status(200).json(updatedProfile);
        }
        
    } else {
        //Create

        //Check handle exists

        let checkHandleProfile = null;

        try {
            checkHandleProfile = await Profile.findOne({handle: profileFields.handle});
        } catch (error) {
            return res.status(500).json(error);
        }

        if(checkHandleProfile) {
            errors.handle = 'That handle already exists';
            res.status(400).json(errors);
        }

        let newProfile = null;

        try {
            newProfile =  await new Profile(profileFields).save();         
        } catch (error) {
            return res.status(500).json(error);
        }

        if(newProfile) {
            return res.status(200).json(newProfile);
        }
    }
}

const addExperience = async (req, res, next) => {
    let {errors, isValid} = ValidateExperienceInput(req.body);

    if(!isValid) {
        return res.status(400).json(errors);
    }

    let profile = null;

    try {
        profile = await Profile.findOne({user: req.user.id});
    } catch (error) {
        return res.status(500).json(error);
    }

    if(!profile) {
        errors.noprofile = "There is no profile for this user";
        return res.status(404).json(errors);
    }

    let newExp = {};
    newExp.title = req.body.title;
    newExp.company = req.body.company;
    newExp.location = req.body.location;
    newExp.from = req.body.from;
    newExp.to = req.body.to;
    newExp.current = req.body.current;
    newExp.description = req.body.description;

    //Add to exp array
    profile.experience.unshift(newExp);

    let updatedProfile = null;

    try {
        updatedProfile = await profile.save();
    } catch (error) {
        return res.status(500).json(error);
    }

    if(updatedProfile) {
        return res.status(200).json(updatedProfile);
    }
}

const addEducation = async (req, res, next) => {
    let {errors, isValid} = ValidateEducationInput(req.body);

    if(!isValid) {
        return res.status(400).json(errors);
    }

    let profile = null;

    try {
        profile = await Profile.findOne({user: req.user.id});
    } catch (error) {
        return res.status(500).json(error);
    }

    if(!profile) {
        errors.noprofile = "There is no profile for this user";
        return res.status(404).json(errors);
    }

    let newEdu = {};
    newEdu.school = req.body.school;
    newEdu.degree = req.body.degree;
    newEdu.fieldofstudy = req.body.fieldofstudy;
    newEdu.from = req.body.from;
    newEdu.to = req.body.to;
    newEdu.current = req.body.current;
    newEdu.description = req.body.description;

    //Add to exp array
    profile.education.unshift(newEdu);

    let updatedProfile = null;

    try {
        updatedProfile = await profile.save();
    } catch (error) {
        return res.status(500).json(error);
    }

    if(updatedProfile) {
        return res.status(200).json(updatedProfile);
    }
}

const deleteExperience = async (req, res, next) => {
    let errors = {};
    let profile = null;

    try {
        profile = await Profile.findOne({user: req.user.id});
    } catch (error) {
        return res.status(500).json(error);
    }

    if(!profile) {
        errors.noprofile = "There is no profile for this user";
        return res.status(404).json(errors);
    }

    let removedIndex = profile.experience.map((experience) => {
        return experience.id;
    }).indexOf(req.params.exp_id);

    if(removedIndex === -1) {
        errors.noeducation = "This experience not found";
        return res.status(404).json(errors);
    }


    //update deleted experience to exp array
    profile.experience.splice(removedIndex, 1);

    let updatedProfile = null;

    try {
        updatedProfile = await profile.save();
    } catch (error) {
        return res.status(500).json(error);
    }

    if(updatedProfile) {
        return res.status(200).json(updatedProfile);
    }
}

const deleteEducation = async (req, res, next) => {
    let errors = {};
    let profile = null;

    try {
        profile = await Profile.findOne({user: req.user.id});
    } catch (error) {
        return res.status(500).json(error);
    }

    if(!profile) {
        errors.noprofile = "There is no profile for this user";
        return res.status(404).json(errors);
    }

    let removedIndex = profile.education.map((education) => {
        return education.id;
    }).indexOf(req.params.edu_id);

    if(removedIndex === -1) {
        errors.noeducation = "This education not found";
        return res.status(404).json(errors);
    }


    //update deleted education to exp array
    profile.education.splice(removedIndex, 1);

    let updatedProfile = null;

    try {
        updatedProfile = await profile.save();
    } catch (error) {
        return res.status(500).json(error);
    }

    if(updatedProfile) {
        return res.status(200).json(updatedProfile);
    }
}

const deleteProfile = async (req, res, next) => {
    let errors = {};
    let profile = null;

    try {
        profile = await Profile.findOneAndRemove({user: req.user.id});
    } catch (error) {
        return res.status(500).json(error);
    }

    if(!profile) {
        errors.noprofile = "There is no profile for this user";
        return res.status(404).json(errors);
    }

    let user = null;

    try {
        user = await User.findByIdAndRemove(req.user.id);
    } catch (error) {
        return res.status(500).json(error);
    }

    if(!user) {
        errors.nouser = "This user not found";
        return res.status(404).json(errors);
    }

    return res.status(200).json({success: true});
}

export {
    getCurrentProfile,
    getAllProfiles,
    getProfileByUserID,
    getProfileByHandle,
    createAndEditProfile,
    addExperience,
    addEducation,
    deleteExperience,
    deleteEducation,
    deleteProfile
}