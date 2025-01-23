import { ThemeSupa } from "@supabase/auth-ui-shared"
import type { Provider } from "@supabase/supabase-js"

export const oauthProviders = ["google"] as Provider[]

// use the css variables from DaisyUI to style Supabase auth template
export const sharedAppearance = {
    theme: ThemeSupa,
    variables: {
        default: {
            colors: {
                brand: "hsl(var(--p))",
                brandAccent: "hsl(var(--pf))",
                inputText: "hsl(var(--bc))",
                brandButtonText: "hsl(var(--pc))",
                messageText: "hsl(var(--bc))",
                dividerBackground: "hsl(var(--b2))",
                inputLabelText: "hsl(var(--bc))",
                defaultButtonText: "hsl(var(--bc))",
                anchorTextColor: "hsl(var(--p))",
                inputBackground: "hsl(var(--b1))",
                inputBorder: "hsl(var(--b2))",
            },
            fonts: {
                bodyFontFamily: `ui-sans-serif, system-ui, sans-serif`,
            },
            fontSizes: {
                baseInputSize: "16px",
                baseLabelSize: "14px",
                baseButtonSize: "16px",
            },
            radii: {
                borderRadiusButton: "0.5rem",
                inputBorderRadius: "0.5rem",
            },
            space: {
                inputPadding: "0.75rem 1rem",
                buttonPadding: "0.75rem 1.25rem",
            },
        },
    },
    className: {
        button: "authBtn shadow-md hover:shadow-lg transition-all duration-200",
        input: "focus:ring-2 ring-primary/20 transition-all duration-200",
        anchor: "hover:text-primary-focus transition-colors duration-200",
        container: "space-y-4",
        message: "text-sm",
    },
}
