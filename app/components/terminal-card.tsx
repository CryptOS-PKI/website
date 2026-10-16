/*
Copyright The CryptOS Authors.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
import "./marketing.css";

interface TerminalCardProps {
  title: string;
  lines: string[];
}

// Base-layer component: the terminal-style card for a hero's right-hand
// slot. The shape is the base; a product supplies its own illustrative
// lines.
export const TerminalCard = ({ title, lines }: TerminalCardProps) => (
  <div className="terminal" role="img" aria-label={`Illustrative terminal output: ${title}`}>
    <div className="terminal__bar">
      <span className="terminal__dot terminal__dot--red" />
      <span className="terminal__dot terminal__dot--yellow" />
      <span className="terminal__dot terminal__dot--green" />
      <span className="terminal__title">{title}</span>
    </div>
    <pre className="terminal__body">
      <code>
        {lines.join("\n")}
        <span className="terminal__cursor" aria-hidden="true" />
      </code>
    </pre>
  </div>
);
