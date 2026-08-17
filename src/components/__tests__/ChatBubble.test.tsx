import React from 'react';
import renderer from 'react-test-renderer';
import ChatBubble from '../ChatBubble';

describe('ChatBubble', () => {
  it('menampilkan konten pesan', () => {
    const tree = renderer
      .create(<ChatBubble role="assistant" content="Fotosintesis adalah..." />)
      .toJSON();
    expect(JSON.stringify(tree)).toContain('Fotosintesis adalah...');
  });

  it('menampilkan konten pesan user', () => {
    const tree = renderer.create(<ChatBubble role="user" content="Apa itu fotosintesis?" />).toJSON();
    expect(JSON.stringify(tree)).toContain('Apa itu fotosintesis?');
  });
});
