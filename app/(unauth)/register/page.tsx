import { RegisterForm } from "@/components/register-form"

export const generateMetadata = () => {
  return {
    title: 'Register',
  };
};

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <RegisterForm />
      </div>
    </div>
  )
}
