export default function GridBackground() {
    return (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            {/* Horizontal Lines */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

            {/* Radial Gradient Fades */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_100%_200px,#00ff9d10,transparent)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_0%_300px,#9d00ff10,transparent)]"></div>
        </div>
    );
}
