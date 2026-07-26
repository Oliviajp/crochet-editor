import "./Toolbar.css";

export default function Toolbar(props: any) {
  console.log(props);
  return (
    <div className="toolbar">
      <button onClick={() => props.setSelectedTool("SELECT")}>Select</button>
      <button>Move</button>

      <button onClick={() => props.setSelectedTool("MR")}>MR</button>
      <button onClick={() => props.setSelectedTool("CH")}>CH</button>
      <button onClick={() => props.setSelectedTool("SLST")}>SLST</button>
      <button onClick={() => props.setSelectedTool("SC")}>SC</button>
      <button onClick={() => props.setSelectedTool("HDC")}>HDC</button>
      <button onClick={() => props.setSelectedTool("DC")}>DC</button>
      <button onClick={() => props.setSelectedTool("TR")}>TR</button>

      <button>Undo</button>
      <button>Redo</button>
    </div>
  );
}
