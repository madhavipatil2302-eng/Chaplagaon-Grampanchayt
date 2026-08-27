import PermissionMatrix, { defaultPermissionModules, permissionRoles } from "../Permission/permission.js";

function normalizeModules(modules = []) {
  const defaultByKey = new Map(defaultPermissionModules.map((module) => [module.moduleKey, module]));

  return modules.map((module) => {
    const defaultModule = defaultByKey.get(module.moduleKey) || {};

    return {
      moduleKey: module.moduleKey || defaultModule.moduleKey,
      moduleName: module.moduleName || defaultModule.moduleName,
      permissions: {
        admin: "CRUD",
        sarpanch: module.permissions?.sarpanch || "",
        deputySarpanch: module.permissions?.deputySarpanch || "",
        gramsevak: module.permissions?.gramsevak || "",
        dataEntry: module.permissions?.dataEntry || "",
        citizen: "View",
      },
    };
  });
}

async function getOrCreatePermissionMatrix() {
  let matrix = await PermissionMatrix.findOne({ matrixKey: "default" });

  if (!matrix) {
    matrix = await PermissionMatrix.create({
      matrixKey: "default",
      roles: permissionRoles,
      modules: defaultPermissionModules,
    });
  } else {
    const normalizedModules = normalizeModules(matrix.modules);
    const hasPolicyMismatch = normalizedModules.some((module, index) => {
      const currentModule = matrix.modules[index];

      return currentModule?.permissions?.admin !== "CRUD" || currentModule?.permissions?.citizen !== "View";
    });

    if (hasPolicyMismatch) {
      matrix.modules = normalizedModules;
      await matrix.save();
    }
  }

  return matrix;
}

export const getPermissionMatrix = async (req, res) => {
  try {
    const matrix = await getOrCreatePermissionMatrix();

    return res.status(200).json({
      success: true,
      message: "Permission matrix loaded successfully.",
      data: matrix,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const updatePermissionMatrix = async (req, res) => {
  try {
    const modules = Array.isArray(req.body?.modules) ? req.body.modules : null;

    if (!modules) {
      return res.status(400).json({
        success: false,
        message: "Modules array is required.",
      });
    }

    const matrix = await PermissionMatrix.findOneAndUpdate(
      { matrixKey: "default" },
      {
        $set: {
          roles: permissionRoles,
          modules: normalizeModules(modules),
          updatedBy: req.user?.id,
        },
      },
      { new: true, upsert: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Permission matrix saved successfully.",
      data: matrix,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
