import { Link } from "react-router";
import { Button } from "../components/ui/button";

const HomePage = () => {
  return (
    <div className="relative font-poppins flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark text-gray-800 dark:text-gray-200">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 px-6 md:px-10 py-4">
        <div className="flex items-center gap-3">
          <div className="size-6 text-primary">
            <svg
              fill="none"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill="currentColor"
                fillRule="evenodd"
                clipRule="evenodd"
                d="M24 4H6V17.3333V30.6667H24V44H42V30.6667V17.3333H24V4Z"
              ></path>
            </svg>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            Task Flow
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link to="/dashboard">Dashboard</Link>
          </Button>
          <Button asChild>
            <Link to="/signin">Sign In</Link>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col items-center px-6 md:px-10 py-16 md:py-24 text-center">
        <div className="max-w-2xl space-y-6">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-gray-900 dark:text-white">
              Organize Your Tasks, Simplify Your Life
            </h1>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
              Task Flow helps you create, update, and track your daily tasks
              effortlessly. Stay organized and boost your productivity with an
              intuitive, distraction-free task manager.
            </p>
          </div>

          <div className="flex justify-center">
            <Button className="h-12 px-8 text-base font-semibold tracking-wide">
              Get Started for Free
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
