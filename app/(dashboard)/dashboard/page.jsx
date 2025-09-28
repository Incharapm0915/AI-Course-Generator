import { auth, redirectToSignIn } from '@clerk/nextjs';

export default function DashboardPage() {
  const { userId } = auth();

  if (!userId) {
    redirectToSignIn();
    return null;
  }

  return <div>Welcome to your dashboard, user {userId}!</div>;
}
import { withAuth, ClerkLoading, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs';

function Dashboard() {
  return <div>Protected Dashboard Content</div>;
}
import { jsPDF } from 'jspdf';

function exportCoursePDF(course) {
  const doc = new jsPDF();
  doc.setFontSize(20);
  doc.text(course.title, 10, 20);

  doc.setFontSize(12);
  doc.text('Learning Goals:', 10, 30);
  doc.text(course.goals, 10, 40);

  doc.text('Course Content:', 10, 50);
  const contentText = JSON.stringify(course.content, null, 2);
  
  // Split content text to fit page width
  const splitContent = doc.splitTextToSize(contentText, 180);
  doc.text(splitContent, 10, 60);

  doc.save(`${course.title.replace(/\s+/g, '_')}.pdf`);
}
<button
  onClick={() => exportCoursePDF(course)}
  className="mt-4 bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900"
>
  Export as PDF
</button>
