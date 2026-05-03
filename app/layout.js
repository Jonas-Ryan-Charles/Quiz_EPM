import './globals.css';

export const metadata = {
  title: 'ENGI 2003 Quiz Trainer',
  description: 'Engineering Project Management MCQ practice quiz with timer and results.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
