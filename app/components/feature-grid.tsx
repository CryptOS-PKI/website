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

interface FeatureItem {
  title: string;
  body: string;
}

interface FeatureGridProps {
  items: FeatureItem[];
}

// Base-layer component: a responsive grid of feature cards. Mirrors the
// Astro proof's FeatureGrid.astro.
export const FeatureGrid = ({ items }: FeatureGridProps) => (
  <ul className="feature-grid">
    {items.map((item) => (
      <li key={item.title} className="feature-card">
        <h3 className="feature-card__title">{item.title}</h3>
        <p className="feature-card__body">{item.body}</p>
      </li>
    ))}
  </ul>
);
