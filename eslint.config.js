import js from '@eslint/js';
import playwright from 'eslint-plugin-playwright';

export default [
    js.configs.recommended,
    {
        files: ['**/*.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                console: 'readonly',
                window: 'readonly',
                document: 'readonly',
                navigator: 'readonly',
                fetch: 'readonly',
                performance: 'readonly',
                AudioContext: 'readonly',
                webkitAudioContext: 'readonly',
                speechSynthesis: 'readonly',
                SpeechSynthesisUtterance: 'readonly',
                webkitSpeechRecognition: 'readonly',
                SpeechRecognition: 'readonly',
                WebGLRenderingContext: 'readonly',
                requestAnimationFrame: 'readonly',
                cancelAnimationFrame: 'readonly',
                setTimeout: 'readonly',
                clearTimeout: 'readonly',
                setInterval: 'readonly',
                clearInterval: 'readonly',
                localStorage: 'readonly',
                DOMParser: 'readonly',
                CustomEvent: 'readonly',
                // Classes defined in other files
                RetroMusicPlayer: 'readonly',
                SystemMonitor: 'readonly',
                TextStreamer: 'readonly',
                AIService: 'readonly',
                MarkdownLoader: 'readonly',
                VoiceInterface: 'readonly',
                AudioVisualizer: 'readonly'
            }
        },
        rules: {
            'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
            'no-console': 'off',
            'prefer-const': 'error',
            'no-var': 'error'
        }
    },
    {
        files: ['**/*.cjs', 'tests/fixtures/*.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'script',
            globals: {
                module: 'readonly',
                exports: 'readonly',
                require: 'readonly',
                process: 'readonly',
                __dirname: 'readonly',
                __filename: 'readonly'
            }
        }
    },
    {
        files: ['api/**/*.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                console: 'readonly',
                process: 'readonly',
                Buffer: 'readonly',
                __dirname: 'readonly',
                __filename: 'readonly'
            }
        }
    },
    {
        files: ['tests/**/*.js', '**/*.spec.js', '**/*.test.js'],
        plugins: {
            playwright
        },
        rules: {
            ...playwright.configs.recommended.rules
        },
        languageOptions: {
            globals: {
                test: 'readonly',
                expect: 'readonly',
                require: 'readonly'
            }
        }
    }
];