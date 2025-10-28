export default function Button({ handleClick, text, className = "" }) {
  return (
    <button
      type="button"
      onClick={handleClick}
      className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
    >
      {text}
    </button>
  );
}
