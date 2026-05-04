"""Added profile fields

Revision ID: 9ab64ba4547d
Revises:
Create Date: 2026-05-04 20:12:35.063119
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '9ab64ba4547d'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Update existing column length
    with op.batch_alter_table('user_progress', schema=None) as batch_op:
        batch_op.alter_column(
            'video_embed_url',
            existing_type=sa.VARCHAR(length=255),
            type_=sa.String(length=300),
            existing_nullable=True
        )

    # Add new profile fields to users table
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.add_column(sa.Column('phone', sa.String(length=20), nullable=True))
        batch_op.add_column(sa.Column('location', sa.String(length=200), nullable=True))
        batch_op.add_column(sa.Column('college', sa.String(length=200), nullable=True))
        batch_op.add_column(sa.Column('branch', sa.String(length=100), nullable=True))
        batch_op.add_column(sa.Column('year', sa.String(length=50), nullable=True))
        batch_op.add_column(sa.Column('linkedin', sa.String(length=200), nullable=True))
        batch_op.add_column(sa.Column('github', sa.String(length=200), nullable=True))
        batch_op.add_column(sa.Column('bio', sa.Text(), nullable=True))

        batch_op.alter_column(
            'password_hash',
            existing_type=sa.VARCHAR(length=200),
            type_=sa.String(length=255),
            existing_nullable=False
        )


def downgrade():
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.alter_column(
            'password_hash',
            existing_type=sa.String(length=255),
            type_=sa.VARCHAR(length=200),
            existing_nullable=False
        )

        batch_op.drop_column('bio')
        batch_op.drop_column('github')
        batch_op.drop_column('linkedin')
        batch_op.drop_column('year')
        batch_op.drop_column('branch')
        batch_op.drop_column('college')
        batch_op.drop_column('location')
        batch_op.drop_column('phone')

    with op.batch_alter_table('user_progress', schema=None) as batch_op:
        batch_op.alter_column(
            'video_embed_url',
            existing_type=sa.String(length=300),
            type_=sa.VARCHAR(length=255),
            existing_nullable=True
        )