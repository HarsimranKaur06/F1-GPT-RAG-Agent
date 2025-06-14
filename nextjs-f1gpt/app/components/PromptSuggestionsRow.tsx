import PromptSuggestionButton from "./PromptSuggesstionButton"

const PromptSuggestionsRow = ({ onPromptClick }) => {
    const prompts = [
            "Who is the highest paid F1 driver?",
            "Who will be the newest driver for Ferrari?",
            "Who is the current Formula One World Driver's Champion?"
        ]

    return (
        <div className="prompt-suggestion-row">
            {prompts.map((prompt, index) => 
                <PromptSuggestionButton 
                    key={`suggestion-${index}`}
                    text={prompt}
                    onClick={() => onPromptClick(prompt)}
                />
            )}
        </div>
    )
}
export default PromptSuggestionsRow