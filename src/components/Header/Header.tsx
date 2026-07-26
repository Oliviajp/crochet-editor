import "./Header.css";

export default function Header() {
  return (
    <header className="header">
      <button className="menu-button">File</button>
      <button className="menu-button">Edit</button>
      <button className="menu-button">View</button>
      <button className="menu-button">Tools</button>
      <button className="menu-button">Help</button>
    </header>
  );
}
