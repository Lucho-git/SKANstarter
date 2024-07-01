import { r as redirect, f as fail } from "../../../../../chunks/index.js";
const actions = {
  updateEmail: async ({ request, locals: { supabase, getSession } }) => {
    const session = await getSession();
    if (!session) {
      throw redirect(303, "/login");
    }
    const formData = await request.formData();
    const email = formData.get("email");
    let validationError;
    if (!email || email === "") {
      validationError = "An email address is required";
    } else if (!email.includes("@")) {
      validationError = "A valid email address is required";
    }
    if (validationError) {
      return fail(400, {
        errorMessage: validationError,
        errorFields: ["email"],
        email
      });
    }
    const { error } = await supabase.auth.updateUser({ email });
    if (error) {
      return fail(500, {
        errorMessage: "Unknown error 001. If this persists please contact us.",
        email
      });
    }
    return {
      email
    };
  },
  updatePassword: async ({ request, locals: { supabase, getSession } }) => {
    const session = await getSession();
    if (!session) {
      throw redirect(303, "/login");
    }
    const formData = await request.formData();
    const newPassword1 = formData.get("newPassword1");
    const newPassword2 = formData.get("newPassword2");
    const currentPassword = formData.get("currentPassword");
    const recoveryAmr = session.user?.amr?.find((x) => x.method === "recovery");
    const isRecoverySession = recoveryAmr && !currentPassword;
    if (isRecoverySession) {
      const timeSinceLogin = Date.now() - recoveryAmr.timestamp * 1e3;
      if (timeSinceLogin > 1e3 * 60 * 15) {
        return fail(400, {
          errorMessage: 'Recovery code expired. Please log out, then use "Forgot Password" on the sign in page to reset your password. Codes are valid for 15 minutes.',
          errorFields: [],
          newPassword1,
          newPassword2,
          currentPassword: ""
        });
      }
    }
    let validationError;
    const errorFields = [];
    if (!newPassword1) {
      validationError = "You must type a new password";
      errorFields.push("newPassword1");
    }
    if (!newPassword2) {
      validationError = "You must type the new password twice";
      errorFields.push("newPassword2");
    }
    if (newPassword1.length < 6) {
      validationError = "The new password must be at least 6 charaters long";
      errorFields.push("newPassword1");
    }
    if (newPassword1.length > 72) {
      validationError = "The new password can be at most 72 charaters long";
      errorFields.push("newPassword1");
    }
    if (newPassword1 != newPassword2) {
      validationError = "The passwords don't match";
      errorFields.push("newPassword1");
      errorFields.push("newPassword2");
    }
    if (!currentPassword && !isRecoverySession) {
      validationError = "You must include your current password. If you forgot it, sign out then use 'forgot password' on the sign in page.";
      errorFields.push("currentPassword");
    }
    if (validationError) {
      return fail(400, {
        errorMessage: validationError,
        errorFields: [...new Set(errorFields)],
        // unique values
        newPassword1,
        newPassword2,
        currentPassword
      });
    }
    if (!isRecoverySession) {
      const { error: error2 } = await supabase.auth.signInWithPassword({
        email: session?.user.email || "",
        password: currentPassword
      });
      if (error2) {
        throw redirect(303, "/login/current_password_error");
      }
    }
    const { error } = await supabase.auth.updateUser({
      password: newPassword1
    });
    if (error) {
      return fail(500, {
        errorMessage: "Unknown error 004. If this persists please contact us.",
        newPassword1,
        newPassword2,
        currentPassword
      });
    }
    return {
      newPassword1,
      newPassword2,
      currentPassword
    };
  },
  deleteAccount: async ({
    request,
    locals: { supabase, supabaseServiceRole, getSession }
  }) => {
    const session = await getSession();
    if (!session) {
      throw redirect(303, "/login");
    }
    const formData = await request.formData();
    const currentPassword = formData.get("currentPassword");
    if (!currentPassword) {
      return fail(400, {
        errorMessage: "You must provide your current password to delete your account. If you forgot it, sign out then use 'forgot password' on the sign in page.",
        errorFields: ["currentPassword"],
        currentPassword
      });
    }
    const { error: pwError } = await supabase.auth.signInWithPassword({
      email: session?.user.email || "",
      password: currentPassword
    });
    if (pwError) {
      throw redirect(303, "/login/current_password_error");
    }
    const { error } = await supabaseServiceRole.auth.admin.deleteUser(
      session.user.id,
      true
    );
    if (error) {
      return fail(500, {
        errorMessage: "Unknown error 002. If this persists please contact us.",
        currentPassword
      });
    }
    await supabase.auth.signOut();
    throw redirect(303, "/");
  },
  updateProfile: async ({ request, locals: { supabase, getSession } }) => {
    const session = await getSession();
    if (!session) {
      throw redirect(303, "/login");
    }
    const formData = await request.formData();
    const fullName = formData.get("fullName");
    const companyName = formData.get("companyName");
    const website = formData.get("website");
    const surveyCompleted = formData.get("surveyCompleted");
    console.log("Form data:", { fullName, companyName, website });
    let validationError;
    const errorFields = [];
    if (!fullName) {
      validationError = "Name is required";
      errorFields.push("fullName");
    }
    if (validationError) {
      console.log("Validation error:", validationError);
      return fail(400, {
        errorMessage: validationError,
        errorFields,
        fullName,
        companyName,
        website
      });
    }
    const profileData = {
      id: session?.user.id,
      full_name: fullName,
      updated_at: /* @__PURE__ */ new Date()
    };
    if (companyName) {
      profileData.company_name = companyName;
    }
    if (website) {
      profileData.website = website;
    }
    if (surveyCompleted !== void 0) {
      profileData.survey_completed = surveyCompleted === "true";
    }
    console.log("Profile data:", profileData);
    const { error: profileError } = await supabase.from("profiles").upsert(profileData);
    if (profileError) {
      console.error("Supabase profile error:", profileError);
      return fail(500, {
        errorMessage: "Unknown error 005. If this persists please contact us.",
        fullName,
        companyName,
        website,
        surveyCompleted
      });
    }
    const { data: userData, error: metadataError } = await supabase.auth.updateUser({
      data: { name: fullName }
    });
    if (metadataError) {
      console.error("Supabase metadata error:", metadataError);
      return fail(500, {
        errorMessage: "Unknown error 003. If this persists please contact us.",
        fullName,
        companyName,
        website,
        surveyCompleted
      });
    }
    console.log("User metadata updated successfully:", userData);
    await supabase.auth.refreshSession();
    const successResponse = {
      success: true,
      fullName,
      companyName: companyName || "",
      website: website || "",
      surveyCompleted: profileData.survey_completed
    };
    console.log("Success response:", successResponse);
    return successResponse;
  },
  signout: async ({ locals: { supabase, getSession } }) => {
    const session = await getSession();
    if (session) {
      await supabase.auth.signOut();
      throw redirect(303, "/");
    } else {
      throw redirect(303, "/");
    }
  },
  uploadFile: async ({ request, locals: { supabase, getSession } }) => {
    const session = await getSession();
    if (!session) {
      throw redirect(303, "/login");
    }
    const contentType = request.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const { file, ...rest } = await request.json();
      if (!file) {
        return fail(400, {
          errorMessage: "No file selected"
        });
      }
      const { data, error } = await supabase.storage.from("user_files").upload(`user_${session.user.id}/${file.name}`, file);
      if (error) {
        console.error("Error uploading file:", error);
        return fail(500, {
          errorMessage: "Error uploading file. If this persists please contact us."
        });
      }
      return {
        data
      };
    }
    if (contentType && contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file");
      if (!file) {
        return fail(400, {
          errorMessage: "No file selected"
        });
      }
      const { data, error } = await supabase.storage.from("user_files").upload(`user_${session.user.id}/${file.name}`, file);
      if (error) {
        console.error("Error uploading file:", error);
        return fail(500, {
          errorMessage: "Error uploading file. If this persists please contact us."
        });
      }
      return {
        data
      };
    }
    return fail(400, {
      errorMessage: "Invalid request format"
    });
  },
  fetchUploadedFiles: async ({ request, locals: { supabase, getSession } }) => {
    const session = await getSession();
    if (!session) {
      throw redirect(303, "/login");
    }
    const contentType = request.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const { data, error } = await supabase.storage.from("user_files").list(`user_${session.user.id}`, {
        limit: 100,
        offset: 0,
        sortBy: { column: "name", order: "asc" }
      });
      if (error) {
        console.error("Error fetching uploaded files:", error);
        return fail(500, {
          errorMessage: "Error fetching uploaded files. If this persists please contact us."
        });
      }
      return {
        files: data.map((file) => file.name)
      };
    }
    if (contentType && contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const action = formData.get("action");
      if (action === "fetchUploadedFiles") {
        const { data, error } = await supabase.storage.from("user_files").list(`user_${session.user.id}`, {
          limit: 100,
          offset: 0,
          sortBy: { column: "name", order: "asc" }
        });
        if (error) {
          console.error("Error fetching uploaded files:", error);
          return fail(500, {
            errorMessage: "Error fetching uploaded files. If this persists please contact us."
          });
        }
        return {
          files: data.map((file) => file.name)
        };
      }
    }
    return fail(400, {
      errorMessage: "Invalid request format"
    });
  }
};
export {
  actions
};
