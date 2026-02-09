
const menuItems = [
    "Dashboard",
    "Chat",
    "Tasks",
    "Settings",
];

export default function Sidebar() {

    return(
        <div  className="w-24 bg-bg flex flex-col items-center py-6 border-r border-gray-700">
            {menuItems.map((item) => (
                <button
                key={item}
                className="my-2 w-full px-3 py-3 text-sm text-textPrimary hover:text-neonBlue hover:shadow-neon rounded transition-all duration-300">
                {item}    
                </button>
            ))}
        </div>
    );
}