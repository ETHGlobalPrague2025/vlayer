export default function Home() {
  return (
    <div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          maxWidth: 600,
          margin: "2rem auto",
        }}
      >
        <input
          type="file"
          accept=".eml"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const rawText = await file.text();
            const escapedText = rawText
              .replace(/\\/g, "\\\\") // escape backslashes first
              .replace(/\r/g, "\\r")
              .replace(/\n/g, "\\n")
              .replace(/\t/g, "\\t");

            (
              document.getElementById("file-content") as HTMLTextAreaElement
            ).value = escapedText;
          }}
        />
        <textarea
          id="file-content"
          rows={10}
          style={{ width: "100%" }}
          readOnly
          placeholder="File content will appear here..."
        />
        <button
          onClick={() => {
            const content = (
              document.getElementById("file-content") as HTMLTextAreaElement
            ).value;
            fetch("/api/zkp", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                data: content,
              }),
            })
              .then((response) => response.json())
              .then((data) => {
                console.log("Success:", data);
                alert("File processed successfully!");
              })
              .catch((error) => {
                console.error("Error:", error);
                alert("An error occurred while processing the file.");
              });
            //alert("Processing file content:\n" + content);
          }}
        >
          Process File
        </button>
      </div>
    </div>
  );
}
