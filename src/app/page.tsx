import { StakingTerminal } from "@/components/staking/staking-terminal";

export default function Home() {
	return (
		<div
			className="h-screen w-screen flex justify-center items-center relative overflow-hidden"
			style={{
				background:
					"radial-gradient(circle at center, rgba(98, 255, 208, 0.08) 0%, rgba(0, 0, 0, 0) 70%)",
			}}
		>
			{/* scan lines */}
			<div
				className="absolute inset-0 pointer-events-none opacity-30 z-1"
				style={{
					background: `repeating-linear-gradient(
                        0deg,
                        transparent,
                        transparent 2px,
                        rgba(255, 255, 255, 0.03) 2px,
                        rgba(255, 255, 255, 0.03) 4px
                    )`
				}}
			/>

			<div className="relative z-10 w-full flex justify-center items-center">
				<StakingTerminal />
			</div>
		</div>
	);
}
