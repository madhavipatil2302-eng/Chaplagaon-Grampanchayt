import PermissionMatrix, { defaultPermissionModules, permissionRoles } from "../Permission/permission.js";
import LoginModel from "../Shema/loginSchma.js";
import bcrypt from "bcrypt";
/**
 * Auto-seeds default Permission Matrix and Application Admin user
 * if the database is blank or no Admin account exists.
 */
export const seedDefaultAdminAndPermissions = async () => {
    try {
        // 1. Ensure Default Permission Matrix exists
        let permissionMatrix = await PermissionMatrix.findOne({ matrixKey: "default" });

        if (!permissionMatrix) {
            permissionMatrix = await PermissionMatrix.create({
                matrixKey: "default",
                roles: permissionRoles,
                modules: defaultPermissionModules,
            });
            console.log("[Auto-Seed] Default Permission Matrix created.");
        }

        // 2. Check if an Application Admin account exists
        const adminEmail = "admin@gmail.com";
        const adminPassword = "admin123";

        const HashPassword = await bcrypt.hash(adminPassword, 10);

        let adminUser = await LoginModel.findOne({
            $or: [{ email: adminEmail }, { role: "ApplicationAdmin" }],
        });

        if (!adminUser) {
            adminUser = await LoginModel.create({
                fullName: "Abhijeet Gajadhane",
                name: "Abhijeet Gajadhane",
                role: "ApplicationAdmin",
                profilePhoto: "image.png",
                mobileNumber: "9422647642",
                alternateMobileNumber: "9876500000",
                email: adminEmail,
                pass: HashPassword,
                gender: "Male",
                dateOfBirth: "1985-04-15",
                address: "Chapalgaon, Akkalkot, Solapur",
                villageName: "Chapalgaon",
                wardNumber: "1",
                education: "B.A.",
                occupation: "Agriculture",
                joiningDate: "2022-01-15",
                termStartDate: "2022-02-01",
                termEndDate: "2027-01-31",
                status: "active",
                valid: "active",
                responsibilities: "Overall village administration",
                bio: "Serving as Sarpanch since 2022.",
                electionYear: "2022",
                politicalGroup: "Independent",
                totalVotes: 1568,
                signature: "https://example.com/signature1.png",
                priorityProjects: [

                ],
            });
            console.log(`[Auto-Seed] Default Admin created successfully. Email: ${adminEmail}`);
        }

        return { adminUser, permissionMatrix };
    } catch (error) {
        console.error("[Auto-Seed Error]:", error.message);
        return null;
    }
};

/**
 * Onboarding Controller API Endpoint
 * Handles manual onboarding requests via Postman or script
 */
export const OnboardingController = async (req, res) => {
    try {
        // 1. Extract API Key safely from headers, body, or query
        const apiKey =
            req.headers["x-header-api-key"] ||
            req.headers["x-api-key"] ||
            req.body?.apiKey ||
            req.query?.apiKey;

        const secretKey = process.env.SECRET_KEY || process.env.JWT_SECRET_KEY || "abhijeet";

        if (apiKey && apiKey !== secretKey) {
            return res.status(401).json({
                success: false,
                message: "Invalid API Key.",
            });
        }

        const { adminUser, permissionMatrix } = await seedDefaultAdminAndPermissions();

        return res.status(200).json({
            success: true,
            message: "Default Application Admin and Permissions initialized successfully.",
            data: {
                admin: {
                    id: adminUser?._id,
                    fullName: adminUser?.fullName,
                    email: adminUser?.email,
                    role: adminUser?.role,
                },
                permissionMatrix,
            },
        });
    } catch (error) {
        console.error("Onboarding Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error during onboarding.",
        });
    }
};


export default OnboardingController;



