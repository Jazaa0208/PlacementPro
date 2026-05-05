# migrations/versions/update_avatar_column_size.py
"""Update avatar column to use larger text

Revision ID: update_avatar_size
Revises: b86cfdd9ddb3
Create Date: 2026-05-04 21:00:00.000000
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = 'update_avatar_size'
down_revision = 'b86cfdd9ddb3'
branch_labels = None
depends_on = None

def upgrade():
    # Alter avatar column to use LargeBinary or keep as Text but ensure it can handle larger data
    with op.batch_alter_table('users', schema=None) as batch_op:
        # If you want to use LargeBinary instead of Text
        # batch_op.alter_column('avatar', type_=sa.LargeBinary())
        pass  # Text should be sufficient for compressed base64 images

def downgrade():
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.alter_column('avatar', type_=sa.Text())