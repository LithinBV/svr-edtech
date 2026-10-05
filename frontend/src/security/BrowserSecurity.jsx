// import { useEffect } from "react";

// const BrowserSecurity = () => {
//     useEffect(() => {
//         // Disable right click
//         const handleContextMenu = (e) => {
//             e.preventDefault();
//         };

//         // Disable copy
//         const handleCopy = (e) => {
//             e.preventDefault();
//         };

//         // Disable cut
//         const handleCut = (e) => {
//             e.preventDefault();
//         };

//         // Disable paste
//         const handlePaste = (e) => {
//             e.preventDefault();
//         };

//         // Disable text selection
//         const handleSelectStart = (e) => {
//             e.preventDefault();
//         };

//         // Disable drag
//         const handleDragStart = (e) => {
//             e.preventDefault();
//         };

//         // Disable common browser/dev-tool shortcuts
//         const handleKeyDown = (e) => {
//             const key = e.key.toLowerCase();

//             // Ctrl / CMD shortcuts
//             if (e.ctrlKey || e.metaKey) {
//                 const blockedKeys = [
//                     "c", // Copy
//                     "x", // Cut
//                     "v", // Paste
//                     "u", // View source
//                     "s", // Save page
//                     "p", // Print
//                     "a", // Select all
//                 ];

//                 if (blockedKeys.includes(key)) {
//                     e.preventDefault();
//                     return;
//                 }

//                 // DevTools
//                 if (
//                     e.shiftKey &&
//                     ["i", "j", "c"].includes(key)
//                 ) {
//                     e.preventDefault();
//                     return;
//                 }
//             }

//             // F12
//             if (e.key === "F12") {
//                 e.preventDefault();
//                 return;
//             }

//             // Ctrl + Shift + I/J/C
//             if (
//                 e.ctrlKey &&
//                 e.shiftKey &&
//                 ["i", "j", "c"].includes(key)
//             ) {
//                 e.preventDefault();
//                 return;
//             }

//             // Print Screen
//             if (e.key === "PrintScreen") {
//                 e.preventDefault();

//                 // Clear clipboard if possible
//                 if (navigator.clipboard) {
//                     navigator.clipboard
//                         .writeText("")
//                         .catch(() => {});
//                 }
//             }
//         };

//         // Prevent copy through selection events
//         document.addEventListener(
//             "contextmenu",
//             handleContextMenu
//         );

//         document.addEventListener(
//             "copy",
//             handleCopy
//         );

//         document.addEventListener(
//             "cut",
//             handleCut
//         );

//         document.addEventListener(
//             "paste",
//             handlePaste
//         );

//         document.addEventListener(
//             "selectstart",
//             handleSelectStart
//         );

//         document.addEventListener(
//             "dragstart",
//             handleDragStart
//         );

//         document.addEventListener(
//             "keydown",
//             handleKeyDown
//         );

//         // Disable text selection using CSS
//         document.body.style.userSelect = "none";
//         document.body.style.webkitUserSelect = "none";
//         document.body.style.msUserSelect = "none";

//         return () => {
//             document.removeEventListener(
//                 "contextmenu",
//                 handleContextMenu
//             );

//             document.removeEventListener(
//                 "copy",
//                 handleCopy
//             );

//             document.removeEventListener(
//                 "cut",
//                 handleCut
//             );

//             document.removeEventListener(
//                 "paste",
//                 handlePaste
//             );

//             document.removeEventListener(
//                 "selectstart",
//                 handleSelectStart
//             );

//             document.removeEventListener(
//                 "dragstart",
//                 handleDragStart
//             );

//             document.removeEventListener(
//                 "keydown",
//                 handleKeyDown
//             );

//             document.body.style.userSelect = "";
//             document.body.style.webkitUserSelect = "";
//             document.body.style.msUserSelect = "";
//         };
//     }, []);

//     return null;
// };

// export default BrowserSecurity;