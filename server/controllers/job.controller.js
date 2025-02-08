import { Job } from "../models/job.model.js";

// admin post krega job
export const postJob = async (req, res) => {
    try {
        const { title, description, requirements, salary, location, jobType, experience, position, companyId } = req.body;
        const userId = req.id; // Admin user ID
        
        // Validate required fields
        if (!title || !description || !requirements || !salary || !location || !jobType || !experience || !position || !companyId) {
            return res.status(400).json({
                message: "All fields are required.",
                success: false
            });
        }
        
        // Additional validations (e.g., salary should be a number, companyId should be a valid ObjectId)
        if (isNaN(salary)) {
            return res.status(400).json({
                message: "Salary must be a valid number.",
                success: false
            });
        }

        // Create the job post
        const job = await Job.create({
            title,
            description,
            requirements: requirements.split(","),
            salary: Number(salary), // Ensure salary is a number
            location,
            jobType,
            experienceLevel: experience,
            position,
            company: companyId,
            created_by: userId
        });

        // Return success response with created job details
        return res.status(201).json({
            message: "New job created successfully.",
            job: {
                _id: job._id,
                title: job.title,
                description: job.description,
                salary: job.salary,
                location: job.location,
                jobType: job.jobType,
                experienceLevel: job.experienceLevel,
                position: job.position,
                company: job.company,
                created_by: job.created_by,
                createdAt: job.createdAt,
                updatedAt: job.updatedAt
            },
            success: true
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "An error occurred while creating the job.",
            success: false
        });
    }
}

// student k liye
export const getAllJobs = async (req, res) => {
    try {
        const keyword = req.query.keyword || "";
        const query = {
            $or: [
                { title: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } },
            ]
        };
        const jobs = await Job.find(query).populate({
            path: "company"
        }).sort({ createdAt: -1 });
        if (!jobs) {
            return res.status(404).json({
                message: "Jobs not found.",
                success: false
            })
        };
        return res.status(200).json({
            jobs,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}
// student
export const getJobById = async (req, res) => {
    try {
        const jobId = req.params.id;
        const job = await Job.findById(jobId).populate({
            path:"applications"
        });
        if (!job) {
            return res.status(404).json({
                message: "Jobs not found.",
                success: false
            })
        };
        return res.status(200).json({ job, success: true });
    } catch (error) {
        console.log(error);
    }
}
// admin kitne job create kra hai abhi tk
export const getAdminJobs = async (req, res) => {
    try {
        const adminId = req.id;
        const jobs = await Job.find({ created_by: adminId }).populate({
            path:'company',
            createdAt:-1
        });
        if (!jobs) {
            return res.status(404).json({
                message: "Jobs not found.",
                success: false
            })
        };
        return res.status(200).json({
            jobs,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}
