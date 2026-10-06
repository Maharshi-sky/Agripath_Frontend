export default function Toast({ message }: { message: string | null }) {
  return (
    <div
      className={
        'fixed bottom-7 right-7 z-[900] max-w-[300px] rounded-lg border-l-4 border-brand bg-sidebar px-5 py-3.5 text-sm font-medium text-white shadow-xl transition-transform duration-300 ' +
        (message ? 'translate-x-0' : 'pointer-events-none translate-x-[calc(100%+2rem)]')
      }
    >
      {message}
    </div>
  );
}